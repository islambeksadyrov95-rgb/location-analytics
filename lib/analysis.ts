import { query } from "./db";
import type { Listing, RadiusData } from "./types";

const HAVERSINE = (latParam: string, lonParam: string) => `
  (6371000 * acos(
    LEAST(1, GREATEST(-1,
      cos(radians(${latParam})) * cos(radians(lat)) *
      cos(radians(lon) - radians(${lonParam})) +
      sin(radians(${latParam})) * sin(radians(lat))
    ))
  ))
`;

const NICHE_RUBRICS: Record<string, { direct: string[]; indirect: string[] }> = {
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

/** Получить listing по ID с фотографиями */
export async function getListingById(id: number): Promise<Listing | null> {
  const rows = await query(
    `SELECT l.*,
       COALESCE(
         json_agg(json_build_object('url', p.photo_url, 'sort', p.sort_order))
         FILTER (WHERE p.id IS NOT NULL), '[]'
       ) AS photos
     FROM listings l
     LEFT JOIN listing_photos p ON p.listing_id = l.id
     WHERE l.id = $1
     GROUP BY l.id`,
    [id]
  );
  if (rows.length === 0) return null;
  return mapRowToListing(rows[0]);
}

/** Поиск листингов с фильтрами */
export async function searchListings(opts: {
  district?: string;
  budget?: number;
  propType?: string;
  limit?: number;
  sortBy?: string;
}): Promise<Listing[]> {
  const { district, budget = 99_000_000, propType, limit = 100, sortBy = "score" } = opts;

  const conditions: string[] = ["l.price_month <= $1"];
  const values: (string | number)[] = [budget];
  let paramIndex = 2;

  if (district && district !== "Все" && district !== "all") {
    conditions.push(`l.district = $${paramIndex}`);
    values.push(district);
    paramIndex++;
  }
  if (propType && propType !== "Все") {
    conditions.push(`l.property_type = $${paramIndex}`);
    values.push(propType);
    paramIndex++;
  }

  let orderBy = "l.updated_at DESC";
  if (sortBy === "price") orderBy = "l.price_month ASC";
  else if (sortBy === "price_m2") orderBy = "l.price_per_m2 ASC";
  else if (sortBy === "area") orderBy = "l.area_m2 DESC";

  const sql = `
    SELECT l.*,
      COALESCE(
        json_agg(json_build_object('url', p.photo_url, 'sort', p.sort_order))
        FILTER (WHERE p.id IS NOT NULL), '[]'
      ) AS photos
    FROM listings l
    LEFT JOIN listing_photos p ON p.listing_id = l.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY l.id
    ORDER BY ${orderBy}
    LIMIT $${paramIndex}
  `;
  values.push(limit);

  const rows = await query(sql, values);
  return rows.map(mapRowToListing);
}

/** Радиусный анализ по координатам */
export async function getAnalysis(
  lat: number,
  lon: number,
  niche: string,
  radius: number = 1000
): Promise<RadiusData> {
  const dist = HAVERSINE("$1", "$2");
  const nicheRubrics = NICHE_RUBRICS[niche] || NICHE_RUBRICS.coffee;

  const [directRows, indirectRows, synergyRows, govRows, transportRows, housingRows] =
    await Promise.all([
      // 1. Прямые конкуренты
      query(
        `SELECT name, address, rating, review_count, avg_check, branch_count,
                ${dist} AS dist
         FROM venues
         WHERE rubric_primary = ANY($3)
           AND ${dist} <= $4
         ORDER BY dist LIMIT 20`,
        [lat, lon, nicheRubrics.direct, radius]
      ),
      // 2. Косвенные конкуренты
      query(
        `SELECT name, address, rubric_primary AS type, rating, branch_count,
                ${dist} AS dist
         FROM venues
         WHERE rubric_primary = ANY($3)
           AND ${dist} <= $4
         ORDER BY dist LIMIT 15`,
        [lat, lon, nicheRubrics.indirect, radius]
      ),
      // 3. Синергия
      query(
        `SELECT name, category AS type, subcategory, address,
                ${dist} AS dist, extra
         FROM infrastructure
         WHERE category IN ('business_center', 'mall', 'university', 'fitness', 'cinema')
           AND ${dist} <= $3
         ORDER BY dist LIMIT 15`,
        [lat, lon, radius * 2]
      ),
      // 4. Госорганы
      query(
        `SELECT name, subcategory AS type, ${dist} AS dist
         FROM infrastructure
         WHERE category = 'gov' AND ${dist} <= $3
         ORDER BY dist LIMIT 10`,
        [lat, lon, radius * 2]
      ),
      // 5. Транспорт
      query(
        `SELECT name, extra, ${dist} AS dist
         FROM infrastructure
         WHERE category = 'transport' AND ${dist} <= $3
         ORDER BY dist LIMIT 15`,
        [lat, lon, radius]
      ),
      // 6. Население
      query(
        `SELECT COUNT(*) AS buildings,
                COALESCE(SUM(apartments_count), 0) AS apartments,
                COALESCE(SUM(est_population), 0) AS est_population
         FROM buildings WHERE ${dist} <= $3`,
        [lat, lon, radius]
      ),
    ]);

  const housingData = housingRows[0] || {};

  const transport = transportRows.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    dist: Math.round(Number(r.dist)),
    routes: ((r.extra as Record<string, unknown>)?.routes as string[]) || [],
  }));

  const estPopulation = Number(housingData.est_population) || 0;
  const transportStops = transport.length;
  const estWeekday = Math.round(estPopulation * 0.3 + transportStops * 500);

  return {
    direct: directRows.map((r: Record<string, unknown>) => ({
      name: r.name as string,
      dist: Math.round(Number(r.dist)),
      rating: Number(r.rating) || 0,
      check: (r.avg_check as number) || 0,
      reviews: (r.review_count as number) || 0,
      branches: (r.branch_count as number) || 1,
    })),
    indirect: indirectRows.map((r: Record<string, unknown>) => ({
      name: r.name as string,
      dist: Math.round(Number(r.dist)),
      type: (r.type as string) || "",
      rating: Number(r.rating) || 0,
      branches: (r.branch_count as number) || 1,
    })),
    synergy: synergyRows.map((r: Record<string, unknown>) => ({
      name: r.name as string,
      dist: Math.round(Number(r.dist)),
      type: (r.type as string) || "",
      people: "",
    })),
    gov: govRows.map((r: Record<string, unknown>) => ({
      name: r.name as string,
      dist: Math.round(Number(r.dist)),
      type: (r.type as string) || "",
    })),
    transport,
    housing: {
      buildings: Number(housingData.buildings) || 0,
      apartments: Number(housingData.apartments) || 0,
      totalAreaM2: 0,
      estPopulation,
      avgApartmentM2: 72,
      radius,
    },
    pedestrian: {
      weekday: estWeekday,
      weekend: Math.round(estWeekday * 0.65),
      peakHour: Math.round(estWeekday * 0.15),
      source: "расчёт по транспорту и населению",
    },
  };
}

function mapRowToListing(r: Record<string, unknown>): Listing {
  return {
    id: r.id as number,
    krishaId: r.krisha_id as number,
    district: (r.district as string) || "",
    propertyType: (r.property_type as string) || "",
    address: (r.address as string) || "",
    lat: Number(r.lat) || 0,
    lng: Number(r.lon) || 0,
    area: (r.area_m2 as number) || 0,
    price: (r.price_month as number) || 0,
    m2: (r.price_per_m2 as number) || 0,
    floor: (r.floor as number) || 1,
    ceilings: Number(r.ceilings) || 0,
    condition: (r.condition as string) || "",
    entrance: (r.entrance as string) || "",
    features: (r.features as string[]) || [],
    photos: (r.photos as { url: string; sort: number }[])
      .sort((a, b) => a.sort - b.sort)
      .map((p) => p.url),
    source: `krisha.kz #${r.krisha_id}`,
    sourceUrl: (r.url as string) || "",
    phone: (r.phone as string) || "",
  };
}
