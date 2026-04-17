import { scrapeKrisha, type SearchFilters } from "@/lib/krisha-scraper";
import { computeBasicScore } from "@/lib/scoring";
import type { Listing } from "@/lib/types";

export const maxDuration = 120; // Vercel Pro: до 300с

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const filters: SearchFilters = {
    budget: Number(searchParams.get("budget")) || undefined,
    district: searchParams.get("district") || undefined,
    areaMin: Number(searchParams.get("areaMin")) || undefined,
    areaMax: Number(searchParams.get("areaMax")) || undefined,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 1. Парсим Krisha
        const rawListings = await scrapeKrisha(
          filters,
          (progress, message) => {
            send({ stage: "parsing", progress, message });
          },
          2 // макс 2 страницы для скорости
        );

        send({ stage: "scoring", progress: 80, message: "Рассчитываю скоринг..." });

        // 2. Скоринг
        const scored = rawListings
          .filter((l): l is Listing => !!(l.id && l.area && l.area > 0))
          .map((l) => ({ ...l, _score: computeBasicScore(l) }))
          .sort((a, b) => b._score - a._score);

        send({ stage: "scoring", progress: 95, message: `Готово! ${scored.length} помещений` });

        // 3. Отправляем результат
        send({
          stage: "done",
          progress: 100,
          message: `Найдено ${scored.length} помещений`,
          listings: scored,
        });
      } catch (error) {
        send({
          stage: "error",
          progress: 0,
          message: `Ошибка: ${error instanceof Error ? error.message : "неизвестная ошибка"}`,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
