"""
Парсер коммерческой недвижимости с krisha.kz
Парсит аренду: общепит, офисы, магазины, склады, свободное назначение.
Пишет в Neon PostgreSQL.

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
SEARCH_URLS = {
    "Общепит": "/arenda/pomescheniya-pod-obshepit/almaty/",
    "Офис": "/arenda/ofisy/almaty/",
    "Магазин": "/arenda/pomescheniya-pod-magazin/almaty/",
    "Склад": "/arenda/sklady-i-prombazy/almaty/",
    "Свободное": "/arenda/pomescheniya-svobodnogo-naznacheniya/almaty/",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
}

# Районы Алматы — маппинг из адреса
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
    """Определяет район по адресу."""
    addr_lower = address.lower()
    for district, keywords in DISTRICT_KEYWORDS.items():
        for kw in keywords:
            if kw in addr_lower:
                return district
    return "Алматы"


def parse_listing_page(url: str, session: requests.Session) -> dict | None:
    """Парсит страницу отдельного объявления."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.warning(f"Ошибка загрузки {url}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "lxml")

    # ID из URL: /a/show/12345678
    krisha_id_match = re.search(r"/(\d+)$", url)
    if not krisha_id_match:
        return None
    krisha_id = int(krisha_id_match.group(1))

    # Цена
    price_el = soup.select_one("[class*='offer__price']")
    price_text = price_el.get_text(strip=True) if price_el else "0"
    price = int(re.sub(r"[^\d]", "", price_text) or 0)

    # Ад��ес
    address_el = soup.select_one("[class*='offer__location']")
    address = address_el.get_text(strip=True) if address_el else ""

    # Параметры из dl-таблицы
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

    # Описание
    desc_el = soup.select_one("[class*='offer__description']")
    description = desc_el.get_text(strip=True)[:2000] if desc_el else ""

    # Фотографии
    photos = []
    for img in soup.select("[class*='gallery'] img, [class*='photo'] img"):
        src = img.get("src") or img.get("data-src") or ""
        if src and "krisha.kz" in src:
            photos.append(src.replace("/thumb/", "/full/"))

    # Координаты из скрипта на странице
    lat, lon = None, None
    for script in soup.find_all("script"):
        text = script.string or ""
        lat_match = re.search(r'"lat"\s*:\s*([\d.]+)', text)
        lon_match = re.search(r'"lon"\s*:\s*([\d.]+)', text)
        if lat_match and lon_match:
            lat = float(lat_match.group(1))
            lon = float(lon_match.group(1))
            break

    # Телефон
    phone = params.get("телефон", "")

    # Удобства / features
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


def parse_search_page(search_url: str, page: int, session: requests.Session) -> list[str]:
    """Парсит страницу поиска, возвращает список URL объявлений."""
    url = f"{BASE_URL}{search_url}?page={page}"
    try:
        resp = session.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.warning(f"Ошибка загрузки {url}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    links = []
    for a in soup.select("a[class*='a-card']"):
        href = a.get("href", "")
        if href and "/a/show/" in href:
            links.append(urljoin(BASE_URL, href))

    return list(set(links))


def save_listing(cur, listing: dict, property_type: str):
    """Сохраняет объявление в БД (upsert)."""
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

    # Сохраняем фото
    if listing["photos"]:
        cur.execute("DELETE FROM listing_photos WHERE listing_id = %s", (listing_id,))
        for i, photo_url in enumerate(listing["photos"]):
            cur.execute(
                "INSERT INTO listing_photos (listing_id, photo_url, sort_order) VALUES (%s, %s, %s)",
                (listing_id, photo_url, i),
            )

    return listing_id


def main():
    parser = argparse.ArgumentParser(description="Пар��ер krisha.kz")
    parser.add_argument("--limit", type=int, default=0, help="Лимит объявлений (0 = все)")
    parser.add_argument("--max-pages", type=int, default=50, help="Макс. страниц на категорию")
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

    for prop_type, search_path in SEARCH_URLS.items():
        log.info(f"=== Парсинг: {prop_type} ===")
        page = 1

        while page <= args.max_pages:
            listing_urls = parse_search_page(search_path, page, session)
            if not listing_urls:
                log.info(f"  Страница {page}: нет объявлений, стоп.")
                break

            log.info(f"  Страница {page}: {len(listing_urls)} объявлений")

            for url in listing_urls:
                listing = parse_listing_page(url, session)
                if listing and listing["area_m2"] > 0:
                    listing_id = save_listing(cur, listing, prop_type)
                    total_saved += 1
                    log.info(f"    Сохранено #{listing_id}: {listing['address'][:50]} — {listing['price_month']}₸")

                if args.limit and total_saved >= args.limit:
                    break

                # Пауза между запросами
                time.sleep(1.5)

            if args.limit and total_saved >= args.limit:
                break

            page += 1
            time.sleep(2)

        if args.limit and total_saved >= args.limit:
            break

    log.info(f"Готово. Сохранено {total_saved} объявлений.")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
