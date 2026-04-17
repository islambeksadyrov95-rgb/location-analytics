import type { Listing } from "./types";

// stat.gov.kz 2025: обеспеченность жильём 27.4 м²/чел в городах
export const SQ_M_PER_PERSON = 27.4;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function computeScore(l: Listing, niche: string): number {
  const r = l.radius;
  let s = 50;

  // 1. Конкуренция
  const dc = r.direct.length;
  if (dc === 0) s += 25;
  else if (dc <= 2) s += 15;
  else if (dc <= 4) s += 5;
  else s -= 10;

  // 2. Население
  const pop = r.housing.estPopulation;
  if (pop > 12000) s += 15;
  else if (pop > 6000) s += 10;
  else if (pop > 3000) s += 5;

  // 3. Пешеходный трафик
  const ped = r.pedestrian.weekday;
  if (ped > 15000) s += 10;
  else if (ped > 8000) s += 7;
  else if (ped > 3000) s += 3;

  // 4. Синергия
  s += Math.min(r.synergy.length * 4, 16);

  // 5. Транспорт
  s += Math.min(r.transport.length * 3, 9);

  // 6. Цена за м²
  if (l.m2 < 5000) s += 10;
  else if (l.m2 < 10000) s += 5;

  // 7. Характеристики помещения
  if (l.floor === 1) s += 3;
  if (l.entrance.includes("Отдельный")) s += 2;
  if (l.ceilings >= 3.5) s += 2;

  return Math.max(0, Math.min(100, s));
}

// Форматирование чисел
export const fmt = (n: number): string =>
  n >= 1e6
    ? (n / 1e6).toFixed(1) + " млн"
    : n >= 1000
      ? Math.round(n / 1000) + "к"
      : String(n);

export const fmtN = (n: number): string => n.toLocaleString("ru-RU");
