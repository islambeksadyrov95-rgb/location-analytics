/**
 * Real-time парсер krisha.kz — TypeScript (cheerio + fetch).
 * Используется на Vercel Serverless для парсинга по запросу пользователя.
 */
import * as cheerio from "cheerio";
import type { Listing } from "./types";

const BASE_URL = "https://krisha.kz";
const SEARCH_PATH = "/arenda/kommercheskaya-nedvizhimost/almaty/";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept-Language": "ru-RU,ru;q=0.9",
  Accept: "text/html,application/xhtml+xml",
};

const DISTRICT_KEYWORDS: Record<string, string[]> = {
  Медеуский: ["медеу", "гоголя", "тулебаева", "абая", "достык", "кунаева", "назарбаев"],
  Бостандыкский: ["бостанд", "аль-фараби", "тимирязева", "гагарин"],
  Алмалинский: ["алмалин", "панфилова", "макатаев", "сейфуллин"],
  Ауэзовский: ["ауэзов", "жандосова", "микрорайон", "алтынсарин"],
  Алатауский: ["алатау", "шаляпина", "ташкент"],
  Наурызбайский: ["наурызбай"],
  Турксибский: ["турксиб", "рыскулова", "суюнбая"],
  Жетысуский: ["жетысу", "райымбека"],
};

const PROP_TYPE_KEYWORDS: Record<string, string[]> = {
  Общепит: ["общепит", "кафе", "ресторан", "столовая", "кухня", "пекарня", "кофейня", "фастфуд", "бар"],
  Офис: ["офис", "кабинет", "коворкинг"],
  Магазин: ["магазин", "торгов", "бутик", "шоурум", "павильон"],
  Склад: ["склад", "промбаз", "ангар", "производств"],
};

function detectDistrict(address: string): string {
  const lower = address.toLowerCase();
  for (const [district, keywords] of Object.entries(DISTRICT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return district;
    }
  }
  return "Алматы";
}

function detectPropertyType(text: string): string {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(PROP_TYPE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return type;
    }
  }
  return "Свободное";
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

/** Парсит страницу поиска и возвращает список URL объявлений */
async function parseSearchPage(page: number): Promise<string[]> {
  const url = `${BASE_URL}${SEARCH_PATH}?page=${page}`;
  const html = await fetchPage(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const links: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.includes("/a/show/")) {
      const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      if (!links.includes(full)) links.push(full);
    }
  });

  return links;
}

/** Парсит одно объявление */
async function parseListing(url: string): Promise<Partial<Listing> | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Пробуем JSON из <script id="jsdata">
  const scriptEl = $("#jsdata");
  if (scriptEl.length > 0) {
    const text = scriptEl.text().trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        const data = JSON.parse(text.slice(start, end + 1));
        const result = extractFromJson(data, url, $);
        if (result && result.area && result.area > 0) return result;
      } catch { /* fallback to HTML */ }
    }
  }

  // Fallback: HTML-парсинг
  return extractFromHtml($, url);
}

function extractFromJson(
  data: Record<string, unknown>,
  url: string,
  $: cheerio.CheerioAPI
): Partial<Listing> | null {
  const advert = (data.advert || {}) as Record<string, unknown>;
  const advertsList = data.adverts as Record<string, unknown>[];
  const adverts = Array.isArray(advertsList) && advertsList.length > 0 ? advertsList[0] : {};

  const krishaId = advert.id as number;
  if (!krishaId) return null;

  let price = (advert.price as number) || 0;
  if (typeof price === "string") price = parseInt(String(price).replace(/\D/g, "")) || 0;

  let area = (advert.square as number) || 0;
  if (typeof area === "string") area = parseInt(String(area).replace(/\D/g, "")) || 0;

  const mapData = (advert.map || {}) as Record<string, number>;

  // Фото
  const photos: string[] = [];
  for (const photo of (advert.photos as { src: string }[]) || []) {
    let src = photo.src || "";
    if (src) {
      src = src.replace("/thumb/", "/full/");
      if (!src.startsWith("http")) src = "https:" + src;
      photos.push(src);
    }
  }

  const address = ((adverts as Record<string, unknown>).fullAddress as string) || "";
  const description = ((adverts as Record<string, unknown>).description as string) || "";

  // Парсим dt/dd
  let floor = 1;
  let ceilings = 0;
  let condition = "";
  let entrance = "";
  let phone = "";

  $("dt").each((_, el) => {
    const key = $(el).text().trim().toLowerCase();
    const dd = $(el).next("dd");
    if (!dd.length) return;
    const val = dd.text().trim();
    if (key.includes("этаж")) {
      const m = val.match(/\d+/);
      if (m) floor = parseInt(m[0]);
    } else if (key.includes("потолк")) {
      const m = val.match(/[\d.]+/);
      if (m) ceilings = parseFloat(m[0]);
    } else if (key.includes("состояни")) condition = val;
    else if (key.includes("вход")) entrance = val;
    else if (key.includes("телефон")) phone = val;
  });

  return {
    krishaId,
    address,
    district: detectDistrict(address),
    propertyType: detectPropertyType(`${description} ${condition} ${entrance}`),
    lat: mapData.lat || 0,
    lng: mapData.lon || 0,
    area,
    price,
    m2: area > 0 ? Math.round(price / area) : 0,
    floor,
    ceilings,
    condition,
    entrance,
    features: [],
    photos,
    source: `krisha.kz #${krishaId}`,
    sourceUrl: url,
    phone,
  };
}

function extractFromHtml($: cheerio.CheerioAPI, url: string): Partial<Listing> | null {
  const idMatch = url.match(/\/(\d+)$/);
  if (!idMatch) return null;
  const krishaId = parseInt(idMatch[1]);

  // Цена
  const priceEl = $(".offer__price-part").first();
  const priceText = priceEl.length ? priceEl.text().trim() : "0";
  const price = parseInt(priceText.replace(/\D/g, "")) || 0;

  // Адрес
  let address = "";
  const addrEl = $("[data-name='map.street']");
  if (addrEl.length) {
    const valEl = addrEl.find("[class*='info-value'], dd");
    address = valEl.length ? valEl.text().trim() : addrEl.text().trim();
  } else {
    const locEl = $("[class*='offer__location']");
    address = locEl.length ? locEl.text().trim() : "";
  }
  address = address.replace("показать на карте", "").trim();
  if (address.startsWith("Адрес")) address = address.slice(5).trim();

  // Площадь
  const areaText = $("[data-name='com.square']").text().trim();
  const area = parseInt(areaText.replace(/\D/g, "")) || 0;

  // dt/dd
  const params: Record<string, string> = {};
  $("dt").each((_, el) => {
    const key = $(el).text().trim().toLowerCase();
    const dd = $(el).next("dd");
    if (dd.length) params[key] = dd.text().trim();
  });

  const floorText = params["этаж"] || "";
  const floorMatch = floorText.match(/\d+/);
  const floor = floorMatch ? parseInt(floorMatch[0]) : 1;

  const ceilingsText = params["потолки"] || "";
  const ceilingsMatch = ceilingsText.match(/[\d.]+/);
  const ceilings = ceilingsMatch ? parseFloat(ceilingsMatch[0]) : 0;

  // Фото
  const photos: string[] = [];
  $("[class*='gallery'] img, [class*='photo'] img").each((_, el) => {
    let src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src && (src.includes("krisha") || src.includes("kcdn"))) {
      src = src.replace("/thumb/", "/full/");
      if (!src.startsWith("http")) src = "https:" + src;
      photos.push(src);
    }
  });

  // Координаты
  let lat = 0, lng = 0;
  $("script").each((_, el) => {
    const text = $(el).text() || "";
    const latM = text.match(/"lat"\s*:\s*([\d.]+)/);
    const lonM = text.match(/"lon"\s*:\s*([\d.]+)/);
    if (latM && lonM) {
      lat = parseFloat(latM[1]);
      lng = parseFloat(lonM[1]);
    }
  });

  const desc = $("[class*='offer__description']").text().trim().slice(0, 500);

  return {
    krishaId,
    address,
    district: detectDistrict(address),
    propertyType: detectPropertyType(`${desc} ${params["состояние"] || ""}`),
    lat,
    lng,
    area,
    price,
    m2: area > 0 ? Math.round(price / area) : 0,
    floor,
    ceilings,
    condition: params["состояние"] || "",
    entrance: params["вход"] || "",
    features: [],
    photos,
    source: `krisha.kz #${krishaId}`,
    sourceUrl: url,
    phone: params["телефон"] || "",
  };
}

export interface SearchFilters {
  budget?: number;
  district?: string;
  areaMin?: number;
  areaMax?: number;
}

export type ProgressCallback = (progress: number, message: string) => void;

/**
 * Real-time поиск: парсит Krisha, фильтрует, возвращает листинги.
 * Вызывает onProgress для SSE-стриминга этапов.
 */
export async function scrapeKrisha(
  filters: SearchFilters,
  onProgress: ProgressCallback,
  maxPages: number = 2
): Promise<Partial<Listing>[]> {
  onProgress(5, "Ищем объявления на Крыше...");

  // 1. Собираем URL объявлений со страниц поиска
  const allUrls: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const urls = await parseSearchPage(page);
    allUrls.push(...urls);
    onProgress(5 + (page / maxPages) * 15, `Страница ${page}: найдено ${allUrls.length} объявлений`);
    if (urls.length === 0) break;
  }

  if (allUrls.length === 0) {
    onProgress(100, "Объявлений не найдено");
    return [];
  }

  onProgress(20, `Найдено ${allUrls.length} объявлений, загружаю детали...`);

  // 2. Парсим каждое объявление
  const listings: Partial<Listing>[] = [];
  let counter = 0;
  // Парсим батчами по 5 для скорости
  const batchSize = 5;
  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((url) => parseListing(url)));

    for (const result of results) {
      if (!result || !result.area || result.area <= 0) continue;

      // Фильтрация
      if (filters.budget && result.price && result.price > filters.budget) continue;
      if (filters.district && filters.district !== "Все" && result.district !== filters.district) continue;
      if (filters.areaMin && result.area < filters.areaMin) continue;
      if (filters.areaMax && result.area > filters.areaMax) continue;

      // Генерируем временный id
      result.id = result.krishaId || Date.now() + counter;
      counter++;
      listings.push(result);
    }

    const pct = 20 + ((i + batch.length) / allUrls.length) * 50;
    onProgress(Math.min(70, pct), `Обработано ${Math.min(i + batch.length, allUrls.length)}/${allUrls.length} объявлений (подходит: ${listings.length})`);
  }

  onProgress(75, `Найдено ${listings.length} подходящих помещений`);
  return listings;
}
