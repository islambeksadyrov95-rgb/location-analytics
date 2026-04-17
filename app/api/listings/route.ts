import { type NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const district = params.get("district") || "Все";
  const propType = params.get("propType") || "Все";
  const condition = params.get("condition") || "Все";
  const entrance = params.get("entrance") || "Все";
  const budget = Number(params.get("budget")) || 99_000_000;
  const areaMin = Number(params.get("areaMin")) || 0;
  const areaMax = Number(params.get("areaMax")) || 10000;
  const floorMax = Number(params.get("floorMax")) || 100;
  const ceilingsMin = Number(params.get("ceilingsMin")) || 0;
  const sortBy = params.get("sortBy") || "score";

  const conditions: string[] = [
    "l.price_month <= $1",
    "l.area_m2 >= $2",
    "l.area_m2 <= $3",
    "l.floor <= $4",
    "COALESCE(l.ceilings, 0) >= $5",
  ];
  const values: (string | number)[] = [budget, areaMin, areaMax, floorMax, ceilingsMin];
  let paramIndex = 6;

  if (district !== "Все") {
    conditions.push(`l.district = $${paramIndex}`);
    values.push(district);
    paramIndex++;
  }
  if (propType !== "Все") {
    conditions.push(`l.property_type = $${paramIndex}`);
    values.push(propType);
    paramIndex++;
  }
  if (condition !== "Все") {
    conditions.push(`l.condition = $${paramIndex}`);
    values.push(condition);
    paramIndex++;
  }
  if (entrance !== "Все") {
    conditions.push(`l.entrance ILIKE '%' || $${paramIndex} || '%'`);
    values.push(entrance);
    paramIndex++;
  }

  let orderBy = "l.id DESC";
  if (sortBy === "price") orderBy = "l.price_month ASC";
  else if (sortBy === "price_m2") orderBy = "l.price_per_m2 ASC";
  else if (sortBy === "area") orderBy = "l.area_m2 DESC";

  const sql = `
    SELECT
      l.*,
      COALESCE(
        json_agg(json_build_object('url', p.photo_url, 'sort', p.sort_order))
        FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS photos
    FROM listings l
    LEFT JOIN listing_photos p ON p.listing_id = l.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY l.id
    ORDER BY ${orderBy}
    LIMIT 100
  `;

  const rows = await query(sql, values);

  const listings = rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    krishaId: r.krisha_id,
    district: r.district || "",
    propertyType: r.property_type || "",
    address: r.address || "",
    lat: Number(r.lat) || 0,
    lng: Number(r.lon) || 0,
    area: r.area_m2 || 0,
    price: r.price_month || 0,
    m2: r.price_per_m2 || 0,
    floor: r.floor || 1,
    ceilings: Number(r.ceilings) || 0,
    condition: r.condition || "",
    entrance: r.entrance || "",
    features: r.features || [],
    photos: (r.photos as { url: string; sort: number }[])
      .sort((a, b) => a.sort - b.sort)
      .map((p) => p.url),
    source: `krisha.kz #${r.krisha_id}`,
    sourceUrl: r.url || "",
    phone: r.phone || "",
  }));

  return Response.json({ listings, total: listings.length });
}
