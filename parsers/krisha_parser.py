"""
Парсер коммерческой недвижимости с krisha.kz
Парсит аренду: общепит, офисы, магазины, склады, свободное назначение.
Пишет в Neon PostgreSQL.

Улучшения:
  - JSON-извлечение из <script id="jsdata"> (primary), HTML-скрапинг (fallback)
  - Retry с exponential backoff
  - Max skipped ads — автостоп при массовых ошибках
  - История цен

Запуск:
  python krisha_parser.py              # все страницы
  python krisha_parser.py --limit 5    # только 5 объявлений (тест)
"""
import os
import re
import sys
import json
import time
import argparse
import logging
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import Json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE_URL = "https://krisha.kz"
SEARCH_URL = "/arenda/kommercheskaya-nedvizhimost/almaty/"

# Retry
RETRY_DELAYS = (15, 60, 300, 1200, 3600)
MAX_SKIP_ADS = 5

PROP_TYPE_KEYWORDS = {
    "Общепит": ["общепит", "кафе", "ресторан", "столовая", "кухня", "пекарня", "кофейня", "фастфуд", "бар", "кондитерская"],
    "Офис": ["офис", "кабинет", "коворкинг", "open space"],
    "Магазин": ["магазин", "торгов", "бутик", "шоурум", "showroom", "павильон"],
    "Склад": ["склад", "промбаз", "ангар", "производств", "цех"],
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
}

DISTRICT_KEYWORDS = {
    "Медеуский": ["медеу", "гоголя", "тулебаева", "абая", "достык", "кунаева", "назарбаев", "желтоксан"],
    "Бостандыкский": ["бостанд", "аль-фараби", "тимирязева", "гагарин", "абая"],
    "Алмалинский": ["алмалин", "панфилова", "гоголя", "макатаев", "сейфуллин"],
    "Ауэзовский": ["ауэзов", "жандосова", "микрорайон", "алтынсарин", "навои"],
    "Алатауский": ["алатау", "шаляпина", "ташкент"],
    "Наурызбайский": ["наурызбай"],
    "Турксибский": ["турксиб", "рыскулова", "суюнбая"],
    "Жетысуский": ["жетысу", "райымбека", "сейфуллин"],
}


def detect_district(address: str) -> str:
    addr_lower = address.lower()
    for district, keywords in DISTRICT_KEYWORDS.items():
        for kw in keywords:
            if kw in addr_lower:
                return district
    return "Алматы"


def detect_property_type(text: str) -> str:
    text_lower = text.lower()
    for prop_type, keywords in PROP_TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return prop_type
    return "Свободное"


# ─── HTTP с retry ───────────────────────────────────────────────

def fetch_with_retry(url: str, session: requests.Session) -> requests.Response | None:
    """GET-запрос с exponential backoff."""
    # Первая попытка без задержки
    try:
        resp = session.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return resp
    except requests.RequestException as e:
        log.warning(f"Первая попытка {url}: {e}")

    # Retry с нарастающей задержкой
    for delay in RETRY_DELAYS:
        log.info(f"  Retry через {delay}с: {url}")
        time.sleep(delay)
        try:
            resp = session.get(url, headers=HEADERS, timeout=20)
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:
            log.warning(f"  Retry failed: {e}")

    log.error(f"Все retry исчерпаны для {url}")
    return None


# ─── JSON-извлечение (primary) ──────────────────────────────────

def parse_listing_from_json(soup: BeautifulSoup, url: str) -> dict | None:
    """Извлекает данные из встроенного JSON (как в krisha.kz-main)."""
    script = soup.find("script", id="jsdata")
    if not script or not script.string:
        return None

    text = script.string.strip()
    # Ищем JSON-объект: var data = { ... }
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return None

    try:
        data = json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None

    advert = data.get("advert", {})
    adverts_list = data.get("adverts", [])
    adverts = adverts_list[0] if adverts_list and isinstance(adverts_list, list) and len(adverts_list) > 0 else {}
    if isinstance(adverts, dict):
        pass
    else:
        adverts = {}

    krisha_id = advert.get("id")
    if not krisha_id:
        return None

    price = advert.get("price", 0)
    if isinstance(price, str):
        price = int(re.sub(r"[^\d]", "", price) or 0)

    area = advert.get("square", 0)
    if isinstance(area, str):
        area = int(re.sub(r"[^\d]", "", area) or 0)

    map_data = advert.get("map", {})
    lat = map_data.get("lat")
    lon = map_data.get("lon")

    # Фото из JSON — более надёжно
    photos = []
    for photo in advert.get("photos", []):
        src = photo.get("src", "")
        if src:
            # Убираем thumb, берём full
            src = src.replace("/thumb/", "/full/")
            if not src.startswith("http"):
                src = "https:" + src
            photos.append(src)

    # Адрес
    address = adverts.get("fullAddress", "") or ""
    description = adverts.get("description", "") or ""

    # Парсим этаж и потолки из HTML (в JSON их может не быть для коммерческой)
    floor = 1
    ceilings = 0.0
    condition = ""
    entrance = ""
    features = []
    phone = ""

    # Пробуем dt/dd таблицу
    for dt in soup.select("dt"):
        key = dt.get_text(strip=True).lower()
        dd = dt.find_next_sibling("dd")
        if not dd:
            continue
        val = dd.get_text(strip=True)
        if "этаж" in key:
            m = re.search(r"\d+", val)
            if m:
                floor = int(m.group())
        elif "потолк" in key:
            m = re.search(r"[\d.]+", val)
            if m:
                ceilings = float(m.group())
        elif "состояни" in key:
            condition = val
        elif "вход" in key:
            entrance = val
        elif "телефон" in key:
            phone = val

    for feat in soup.select("[class*='offer__parameters'] li, [class*='features'] li"):
        features.append(feat.get_text(strip=True))

    price_per_m2 = round(price / area) if area > 0 else 0

    return {
        "krisha_id": int(krisha_id),
        "url": url,
        "address": address,
        "district": detect_district(address),
        "lat": float(lat) if lat else None,
        "lon": float(lon) if lon else None,
        "area_m2": area,
        "price_month": price,
        "price_per_m2": price_per_m2,
        "floor": floor,
        "ceilings": ceilings,
        "condition": condition,
        "entrance": entrance,
        "description": description[:2000],
        "features": features,
        "photos": photos,
        "phone": phone,
    }


# ─── HTML-скрапинг (fallback) ──────────────────────────────────

def parse_listing_from_html(soup: BeautifulSoup, url: str) -> dict | None:
    """Fallback: парсит через CSS-селекторы."""
    krisha_id_match = re.search(r"/(\d+)$", url)
    if not krisha_id_match:
        return None
    krisha_id = int(krisha_id_match.group(1))

    price_el = soup.select_one("[class*='offer__price']")
    price_text = price_el.get_text(strip=True) if price_el else "0"
    price = int(re.sub(r"[^\d]", "", price_text) or 0)

    address_el = soup.select_one("[class*='offer__location']")
    address = address_el.get_text(strip=True) if address_el else ""

    params = {}
    for dt in soup.select("dt"):
        key = dt.get_text(strip=True).lower()
        dd = dt.find_next_sibling("dd")
        if dd:
            params[key] = dd.get_text(strip=True)

    area = int(re.sub(r"[^\d]", "", params.get("площадь", "0")) or 0)
    floor_text = params.get("этаж", "1")
    floor = int(re.search(r"\d+", floor_text).group()) if re.search(r"\d+", floor_text) else 1
    ceilings_text = params.get("потолки", "0")
    ceilings_match = re.search(r"[\d.]+", ceilings_text)
    ceilings = float(ceilings_match.group()) if ceilings_match else 0

    condition = params.get("состояние", "")
    entrance = params.get("вход", "")

    desc_el = soup.select_one("[class*='offer__description']")
    description = desc_el.get_text(strip=True)[:2000] if desc_el else ""

    photos = []
    for img in soup.select("[class*='gallery'] img, [class*='photo'] img"):
        src = img.get("src") or img.get("data-src") or ""
        if src and "krisha.kz" in src:
            photos.append(src.replace("/thumb/", "/full/"))

    lat, lon = None, None
    for script in soup.find_all("script"):
        text = script.string or ""
        lat_match = re.search(r'"lat"\s*:\s*([\d.]+)', text)
        lon_match = re.search(r'"lon"\s*:\s*([\d.]+)', text)
        if lat_match and lon_match:
            lat = float(lat_match.group(1))
            lon = float(lon_match.group(1))
            break

    phone = params.get("телефон", "")

    features = []
    for feat in soup.select("[class*='offer__parameters'] li, [class*='features'] li"):
        features.append(feat.get_text(strip=True))

    price_per_m2 = round(price / area) if area > 0 else 0

    return {
        "krisha_id": krisha_id,
        "url": url,
        "address": address,
        "district": detect_district(address),
        "lat": lat,
        "lon": lon,
        "area_m2": area,
        "price_month": price,
        "price_per_m2": price_per_m2,
        "floor": floor,
        "ceilings": ceilings,
        "condition": condition,
        "entrance": entrance,
        "description": description,
        "features": features,
        "photos": photos,
        "phone": phone,
    }


# ─── Основной парсер страницы ───────────────────────────────────

def parse_listing_page(url: str, session: requests.Session) -> dict | None:
    """Парсит страницу объявления. JSON first, HTML fallback."""
    resp = fetch_with_retry(url, session)
    if not resp:
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # Primary: JSON из <script id="jsdata">
    result = parse_listing_from_json(soup, url)
    if result and result["area_m2"] > 0:
        return result

    # Fallback: HTML-скрапинг
    log.info(f"  JSON не найден, fallback на HTML: {url}")
    return parse_listing_from_html(soup, url)


def parse_search_page(search_url: str, page: int, session: requests.Session) -> list[str]:
    """Парсит страницу поиска, возвращает список URL объявлений."""
    url = f"{BASE_URL}{search_url}?page={page}"
    resp = fetch_with_retry(url, session)
    if not resp:
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/a/show/" in href:
            links.append(urljoin(BASE_URL, href))

    return list(set(links))


def save_listing(cur, listing: dict, property_type: str):
    """Сохраняет объявление в БД (upsert) + историю цен."""
    cur.execute("""
        INSERT INTO listings (
            krisha_id, url, property_type, district, address,
            lat, lon, area_m2, price_month, price_per_m2,
            floor, ceilings, condition, entrance, description,
            features, phone, updated_at
        ) VALUES (
            %(krisha_id)s, %(url)s, %(property_type)s, %(district)s, %(address)s,
            %(lat)s, %(lon)s, %(area_m2)s, %(price_month)s, %(price_per_m2)s,
            %(floor)s, %(ceilings)s, %(condition)s, %(entrance)s, %(description)s,
            %(features)s, %(phone)s, NOW()
        )
        ON CONFLICT (krisha_id) DO UPDATE SET
            price_month = EXCLUDED.price_month,
            price_per_m2 = EXCLUDED.price_per_m2,
            description = EXCLUDED.description,
            features = EXCLUDED.features,
            updated_at = NOW()
        RETURNING id
    """, {
        **listing,
        "property_type": property_type,
        "features": Json(listing["features"]),
    })
    listing_id = cur.fetchone()[0]

    # Фото
    if listing["photos"]:
        cur.execute("DELETE FROM listing_photos WHERE listing_id = %s", (listing_id,))
        for i, photo_url in enumerate(listing["photos"]):
            cur.execute(
                "INSERT INTO listing_photos (listing_id, photo_url, sort_order) VALUES (%s, %s, %s)",
                (listing_id, photo_url, i),
            )

    # История цен — записываем если цена изменилась
    cur.execute("""
        INSERT INTO prices (listing_id, price_month)
        SELECT %s, %s
        WHERE NOT EXISTS (
            SELECT 1 FROM prices
            WHERE listing_id = %s
            ORDER BY recorded_at DESC
            LIMIT 1
        )
        OR %s != (
            SELECT price_month FROM prices
            WHERE listing_id = %s
            ORDER BY recorded_at DESC
            LIMIT 1
        )
    """, (listing_id, listing["price_month"], listing_id, listing["price_month"], listing_id))

    return listing_id


def main():
    parser = argparse.ArgumentParser(description="Парсер krisha.kz")
    parser.add_argument("--limit", type=int, default=0, help="Лимит объявлений (0 = все)")
    parser.add_argument("--max-pages", type=int, default=50, help="Макс. страниц")
    args = parser.parse_args()

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        log.error("DATABASE_URL не установлен")
        sys.exit(1)

    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    session = requests.Session()

    total_saved = 0
    skipped_count = 0
    page = 1

    log.info(f"=== Парсинг: {SEARCH_URL} ===")

    while page <= args.max_pages:
        listing_urls = parse_search_page(SEARCH_URL, page, session)
        if not listing_urls:
            log.info(f"  Страница {page}: нет объявлений, стоп.")
            break

        log.info(f"  Страница {page}: {len(listing_urls)} объявлений")

        for url in listing_urls:
            listing = parse_listing_page(url, session)
            if listing and listing["area_m2"] > 0:
                prop_type = detect_property_type(
                    f"{listing.get('description', '')} {listing.get('condition', '')} {listing.get('entrance', '')}"
                )
                listing_id = save_listing(cur, listing, prop_type)
                total_saved += 1
                skipped_count = 0  # Сброс при успехе
                log.info(f"    #{listing_id}: [{prop_type}] {listing['address'][:50]} — {listing['price_month']}₸")
            else:
                skipped_count += 1
                log.warning(f"    Пропуск: {url} (skipped {skipped_count}/{MAX_SKIP_ADS})")
                if skipped_count >= MAX_SKIP_ADS:
                    log.error(f"Достигнут лимит пропусков ({MAX_SKIP_ADS}), остановка.")
                    break

            if args.limit and total_saved >= args.limit:
                break

            time.sleep(1.5)

        if skipped_count >= MAX_SKIP_ADS:
            break
        if args.limit and total_saved >= args.limit:
            break

        page += 1
        time.sleep(2)

    log.info(f"Готово. Сохранено {total_saved} объявлений.")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
