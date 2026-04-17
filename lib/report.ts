import type { Listing, RadiusData } from "./types";
import { computeFullScore, computeBasicScore, fmt, fmtN, SQ_M_PER_PERSON } from "./scoring";

export function generateReport(listing: Listing, niche: string, analysis?: RadiusData): string {
  const score = analysis ? computeFullScore(listing, analysis) : computeBasicScore(listing);
  const scoreLabel =
    score >= 75 ? "Отличная" : score >= 50 ? "Хорошая" : score >= 30 ? "Средняя" : "Слабая";

  const nicheLabels: Record<string, string> = {
    coffee: "Кофейня",
    doner: "Донерная",
    restaurant: "Ресторан",
  };

  const r = analysis;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Отчёт — ${listing.address}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.6; }
  h1 { font-size: 22px; color: #1a1a2e; margin-bottom: 4px; }
  h2 { font-size: 16px; color: #f59e0b; margin: 24px 0 12px; border-bottom: 2px solid #fbbf24; padding-bottom: 6px; }
  h3 { font-size: 14px; color: #1a1a2e; margin: 16px 0 8px; }
  .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #f59e0b; }
  .header .subtitle { color: #6b7280; font-size: 12px; }
  .score-box { display: inline-block; background: ${score >= 75 ? "#dcfce7" : score >= 50 ? "#fef9c3" : "#fee2e2"}; color: ${score >= 75 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626"}; font-size: 28px; font-weight: 900; padding: 12px 24px; border-radius: 12px; margin: 12px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
  .card { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
  .card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .card .value { font-size: 18px; font-weight: 800; color: #1a1a2e; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
  th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #6b7280; }
  td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
  .tag { display: inline-block; background: #f1f5f9; padding: 3px 10px; border-radius: 4px; font-size: 12px; color: #475569; margin: 2px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #9ca3af; font-size: 11px; text-align: center; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>

<div class="header">
  <h1>Location Intelligence Pro</h1>
  <div class="subtitle">Аналитический отчёт по помещению · Алматы</div>
  <div style="margin-top:8px;color:#6b7280;font-size:12px">Дата: ${new Date().toLocaleDateString("ru-RU")} · Ниша: ${nicheLabels[niche] || niche}</div>
</div>

<h2>Помещение</h2>
<div class="grid">
  <div class="card"><div class="label">Адрес</div><div class="value" style="font-size:14px">${listing.address}</div></div>
  <div class="card"><div class="label">Район</div><div class="value" style="font-size:14px">${listing.district}</div></div>
  <div class="card"><div class="label">Площадь</div><div class="value">${listing.area} м²</div></div>
  <div class="card"><div class="label">Аренда</div><div class="value">${fmtN(listing.price)} ₸/мес</div></div>
  <div class="card"><div class="label">Цена за м²</div><div class="value">${fmtN(listing.m2)} ₸</div></div>
  <div class="card"><div class="label">Этаж</div><div class="value">${listing.floor}</div></div>
  <div class="card"><div class="label">Потолки</div><div class="value">${listing.ceilings} м</div></div>
  <div class="card"><div class="label">Состояние</div><div class="value" style="font-size:14px">${listing.condition}</div></div>
</div>
<div style="margin:8px 0">
  <span class="label" style="font-size:11px;color:#6b7280">Вход:</span> ${listing.entrance}<br>
  <span class="label" style="font-size:11px;color:#6b7280">Удобства:</span> ${listing.features.map((f) => `<span class="tag">${f}</span>`).join(" ")}
</div>

<h2>Скоринг локации</h2>
<div style="text-align:center">
  <div class="score-box">${score} / 100</div>
  <div style="font-size:16px;font-weight:700;margin-top:4px">${scoreLabel} локация</div>
</div>

${r ? `
<h2>Прямые конкуренты (${r.direct.length})</h2>
${
  r.direct.length === 0
    ? '<div style="color:#16a34a;font-weight:600;padding:8px 0">Нет прямых конкурентов в радиусе — отличная позиция!</div>'
    : `<table>
  <tr><th>Название</th><th>Расстояние</th><th>Рейтинг</th><th>Отзывы</th><th>Ср. чек</th></tr>
  ${r.direct.map((c) => `<tr><td>${c.name}${c.branches ? ` (${c.branches} фил.)` : ""}</td><td>${c.dist}м</td><td>★${c.rating}</td><td>${fmtN(c.reviews)}</td><td>${c.check ? fmt(c.check) + "₸" : "—"}</td></tr>`).join("")}
</table>`
}

<h2>Косвенные конкуренты (${r.indirect.length})</h2>
${
  r.indirect.length === 0
    ? "<div>Нет</div>"
    : `<table>
  <tr><th>Название</th><th>Тип</th><th>Расстояние</th><th>Рейтинг</th></tr>
  ${r.indirect.map((c) => `<tr><td>${c.name}</td><td>${c.type}</td><td>${c.dist}м</td><td>★${c.rating}</td></tr>`).join("")}
</table>`
}

<h2>Синергия — источники трафика (${r.synergy.length})</h2>
<table>
  <tr><th>Объект</th><th>Тип</th><th>Расстояние</th><th>Аудитория</th></tr>
  ${r.synergy.map((c) => `<tr><td>${c.name}</td><td>${c.type}</td><td>${c.dist}м</td><td>${c.people}</td></tr>`).join("")}
</table>

<h2>Транспортная доступность (${r.transport.length})</h2>
<table>
  <tr><th>Остановка</th><th>Расстояние</th><th>Маршруты</th></tr>
  ${r.transport.map((c) => `<tr><td>${c.name}</td><td>${c.dist}м</td><td>${c.routes.join(", ")}</td></tr>`).join("")}
</table>

<h2>Население и трафик</h2>
<div class="grid">
  <div class="card"><div class="label">Жилых домов</div><div class="value">${r.housing.buildings}</div></div>
  <div class="card"><div class="label">Квартир</div><div class="value">${fmtN(r.housing.apartments)}</div></div>
  <div class="card"><div class="label">Расчётное население</div><div class="value">${fmtN(r.housing.estPopulation)}</div></div>
  <div class="card"><div class="label">Ср. площадь квартиры</div><div class="value">${r.housing.avgApartmentM2} м²</div></div>
  <div class="card"><div class="label">Пешеходы (будни)</div><div class="value">${fmtN(r.pedestrian.weekday)}/день</div></div>
  <div class="card"><div class="label">Пешеходы (выходные)</div><div class="value">${fmtN(r.pedestrian.weekend)}/день</div></div>
</div>
<div style="font-size:11px;color:#6b7280;margin-top:8px">
  Формула населения: площадь ÷ ${SQ_M_PER_PERSON} м²/чел = ${fmtN(r.housing.estPopulation)} жителей (stat.gov.kz, 2025)
</div>

${
  r.gov.length > 0
    ? `<h2>Гос. учреждения (${r.gov.length})</h2>
<table>
  <tr><th>Название</th><th>Тип</th><th>Расстояние</th></tr>
  ${r.gov.map((c) => `<tr><td>${c.name}</td><td>${c.type}</td><td>${c.dist}м</td></tr>`).join("")}
</table>`
    : ""
}
` : '<div style="color:#6b7280;padding:16px;text-align:center">Данные анализа недоступны. Запустите парсеры.</div>'}

<div class="footer">
  <b>Location Intelligence Pro</b> · Алматы<br>
  Источники: krisha.kz · 2gis.kz · stat.gov.kz<br>
  Объявление: ${listing.source}<br>
  Сгенерировано: ${new Date().toLocaleString("ru-RU")}
</div>

</body>
</html>`;
}

export function downloadReport(listing: Listing, niche: string, analysis?: RadiusData) {
  const html = generateReport(listing, niche, analysis);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${listing.district}-${listing.area}m2-${listing.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
