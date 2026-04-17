import type { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAnalysis } from "@/lib/analysis";

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

  const analysis = await getAnalysis(lat, lon, niche, radius);
  return Response.json(analysis);
}
