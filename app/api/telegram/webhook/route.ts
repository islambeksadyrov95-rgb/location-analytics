import type { NextRequest } from "next/server";
import { handleUpdate } from "@/lib/bot-handlers";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    await handleUpdate(update);
  } catch (error) {
    console.error("Telegram webhook error:", error);
  }
  // Всегда 200, иначе Telegram будет ретраить
  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ status: "Telegram webhook active" });
}
