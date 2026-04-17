import type { NextRequest } from "next/server";
import { query } from "@/lib/db";

const HAVERSINE = (latParam: string, lonParam: string) => `
  (6371000 * acos(
    LEAST(1, GREATEST(-1,
      cos(radians(${latParam})) * cos(radians(lat)) *
      cos(radians(lon) - radians(${lonParam})) +
      sin(radians(${latParam})) * sin(radians(lat))
    ))
  ))
`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const radius = Number(searchParams.get("radius")) || 1000;
  const niche = searchParams.get("niche") || "coffee";

  // Получить помещение
  const listings = await query("SELECT * FROM listings WHERE id = $1", [id]);
  if (listings.length === 0) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }
  const listing = listings[0];

  const lat = Number(listing.lat);
  const lon = Number(listing.lon);
  const dist = HAVERSINE("$1", "$2");

  // Маппинг ниши → рубрики
  const nicheMap: Record<string, { direct: string[]; indirect: string[] }> = {
    coffee: {
      direct: ["Кофейни", "Кафе-кондитерские"],
      indirect: ["Пекарни", "Столовые"],
    },
    doner: {
      direct: ["Быстрое питание", "Столовые"],
      indirect: ["Пиццерии", "Бургерные"],
    },
    restaurant: {
      direct: ["Рестораны", "Бары"],
      indirect: ["Кафе", "Столовые"],
    },
  };

  const nicheRubrics = nicheMap[niche] || nicheMap.coffee;

  // 1. Прямые конкуренты
  const directCompetitors = await query(
    `SELECT name, address, rating, review_count, avg_check, branch_count,
            ${dist} AS dist
     FROM venues
     WHERE rubric_primary = ANY($3)
       AND ${dist} <= $4
     ORDER BY dist
     LIMIT 20`,
    [lat, lon, nicheRubrics.direct, radius]
  );

  // 2. Косвенные конкуренты
  const indirectCompetitors = await query(
    `SELECT name, address, rubric_primary AS type, rating, branch_count,
            ${dist} AS dist
     FROM venues
     WHERE rubric_primary = ANY($3)
       AND ${dist} <= $4
     ORDER BY dist
     LIMIT 15`,
    [lat, lon, nicheRubrics.indirect, radius]
  );

  // 3. Синергия (БЦ, ТЦ, вузы, фитнес)
  const synergy = await query(
    `SELECT name, category AS type, subcategory, address,
            ${dist} AS dist,
            extra
     FROM infrastructure
     WHERE category IN ('business_center', 'mall', 'university', 'fitness', 'cinema')
       AND ${dist} <= $3
     ORDER BY dist
     LIMIT 15`,
    [lat, lon, radius * 2]
  );

  // 4. Госорганы
  const gov = await query(
    `SELECT name, subcategory AS type,
            ${dist} AS dist
     FROM infrastructure
     WHERE category = 'gov'
       AND ${dist} <= $3
     ORDER BY dist
     LIMIT 10`,
    [lat, lon, radius * 2]
  );

  // 5. Транспорт
  const transport = await query(
    `SELECT name, extra,
            ${dist} AS dist
     FROM infrastructure
     WHERE category = 'transport'
       AND ${dist} <= $3
     ORDER BY dist
     LIMIT 15`,
    [lat, lon, radius]
  );

  // 6. Население (жилые дома в радиусе)
  const housingRows = await query(
    `SELECT
       COUNT(*) AS buildings,
       COALESCE(SUM(apartments_count), 0) AS apartments,
       COALESCE(SUM(est_population), 0) AS est_population
     FROM buildings
     WHERE ${dist} <= $3`,
    [lat, lon, radius]
  );
  const housingData = housingRows[0] || {};

  // Формат ответа — совместим с фронтенд типами
  const analysis = {
    direct: directCompetitors.map((r: Record<string, unknown>) => ({
      name: r.name,
      dist: Math.round(Number(r.dist)),
      rating: Number(r.rating) || 0,
      check: (r.avg_check as number) || 0,
      reviews: (r.review_count as number) || 0,
      branches: (r.branch_count as number) || 1,
    })),
    indirect: indirectCompetitors.map((r: Record<string, unknown>) => ({
      name: r.name,
      dist: Math.round(Number(r.dist)),
      type: (r.type as string) || "",
      rating: Number(r.rating) || 0,
      branches: (r.branch_count as number) || 1,
    })),
    synergy: synergy.map((r: Record<string, unknown>) => ({
      name: r.name,
      dist: Math.round(Number(r.dist)),
      type: (r.type as string) || "",
      people: "",
    })),
    gov: gov.map((r: Record<string, unknown>) => ({
      name: r.name,
      dist: Math.round(Number(r.dist)),
      type: (r.type as string) || "",
    })),
    transport: transport.map((r: Record<string, unknown>) => ({
      name: r.name,
      dist: Math.round(Number(r.dist)),
      routes: ((r.extra as Record<string, unknown>)?.routes as string[]) || [],
    })),
    housing: {
      buildings: Number(housingData.buildings) || 0,
      apartments: Number(housingData.apartments) || 0,
      totalAreaM2: 0,
      estPopulation: Number(housingData.est_population) || 0,
      avgApartmentM2: 72,
      radius,
    },
    pedestrian: {
      weekday: 0,
      weekend: 0,
      peakHour: 0,
      source: "рассчитывается по транспорту и населению",
    },
  };

  // Оценка пешеходного трафика на основе транспорта и населения
  const transportStops = analysis.transport.length;
  const pop = analysis.housing.estPopulation;
  const estWeekday = Math.round(pop * 0.3 + transportStops * 500);
  analysis.pedestrian.weekday = estWeekday;
  analysis.pedestrian.weekend = Math.round(estWeekday * 0.65);
  analysis.pedestrian.peakHour = Math.round(estWeekday * 0.15);

  return Response.json(analysis);
}
