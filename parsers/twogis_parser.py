"""
Парсер заведений и инфраструктуры из 2ГИС (публичный API).
Парсит: кофейни, донерные, рестораны, кафе, остановки, БЦ, ТЦ, вузы, госорганы, жилые дома.
Пишет в Neon PostgreSQL.

Запуск:
  python twogis_parser.py              # все рубрики
  python twogis_parser.py --limit 10   # по 10 объектов на рубрику (тест)
"""
import os
import sys
import json
import time
import argparse
import logging

import requests
import psycopg2
from psycopg2.extras import Json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# 2ГИС публичный API (используется веб-версией)
API_BASE = "https://catalog.api.2gis.com/3.0/items"

# API ключ 2ГИС (публичный, используется в веб-версии)
API_KEY = "rujany7535"

# Алматы — город в 2ГИС
CITY_ID = "92"  # region_id для Алматы

# Рубрики для парсинга
# Формат: (rubric_id, primary_rubric_name, table, category)
RUBRICS = [
    # Venues (конкуренты — заведения общепита)
    {"rubric_id": "162", "name": "Кофейни", "table": "venues"},
    {"rubric_id": "34789", "name": "Кафе-кондитерские", "table": "venues"},
    {"rubric_id": "164", "name": "Рестораны", "table": "venues"},
    {"rubric_id": "161", "name": "Кафе", "table": "venues"},
    {"rubric_id": "165", "name": "Бары", "table": "venues"},
    {"rubric_id": "50288", "name": "Быстрое питание", "table": "venues"},
    {"rubric_id": "50346", "name": "Пекарни", "table": "venues"},
    {"rubric_id": "50368", "name": "Пиццерии", "table": "venues"},
    {"rubric_id": "50350", "name": "Бургерные", "table": "venues"},
    {"rubric_id": "50361", "name": "Столовые", "table": "venues"},

    # Infrastructure — БЦ, ТЦ
    {"rubric_id": "339", "name": "Бизнес-центры", "table": "infrastructure", "category": "business_center"},
    {"rubric_id": "338", "name": "Торговые центры", "table": "infrastructure", "category": "mall"},

    # Infrastructure — вузы, школы
    {"rubric_id": "306", "name": "Вузы", "table": "infrastructure", "category": "university"},
    {"rubric_id": "305", "name": "Школы", "table": "infrastructure", "category": "school"},

    # Infrastructure — госорганы
    {"rubric_id": "342", "name": "ЦОН", "table": "infrastructure", "category": "gov"},
    {"rubric_id": "361", "name": "Акиматы", "table": "infrastructure", "category": "gov"},
    {"rubric_id": "324", "name": "Налоговые", "table": "infrastructure", "category": "gov"},

    # Infrastructure — транспорт
    {"rubric_id": "60032", "name": "Остановки", "table": "infrastructure", "category": "transport"},
    {"rubric_id": "60050", "name": "Метро", "table": "infrastructure", "category": "transport"},

    # Infrastructure — фитнес, кино
    {"rubric_id": "286", "name": "Фитнес-клубы", "table": "infrastructure", "category": "fitness"},
    {"rubric_id": "167", "name": "Кинотеатры", "table": "infrastructure", "category": "cinema"},

    # Buildings — жилые дома
    {"rubric_id": "60038", "name": "Жилые дома", "table": "buildings"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Referer": "https://2gis.kz/almaty",
}

# Обеспеченность жильём (stat.gov.kz 2025)
SQ_M_PER_PERSON = 27.4


def fetch_items(rubric_id: str, page: int = 1, page_size: int = 50) -> dict:
    """Запрос к API 2ГИС."""
    params = {
        "key": API_KEY,
        "region_id": CITY_ID,
        "rubric_id": rubric_id,
        "page": page,
        "page_size": page_size,
        "fields": "items.point,items.rubrics,items.reviews,items.schedule,items.attribute_groups,items.org,items.context",
        "sort": "relevance",
    }
    try:
        resp = requests.get(API_BASE, params=params, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        log.warning(f"API error rubric {rubric_id} page {page}: {e}")
        return {}


def extract_avg_check(item: dict) -> int | None:
    """Извлекает средний чек из attribute_groups."""
    for group in item.get("attribute_groups", []):
        for attr in group.get("attributes", []):
            name = attr.get("name", "").lower()
            if "чек" in name or "check" in name:
                value = attr.get("value", "")
                # "500-1500 ₸" → берём среднее
                numbers = [int(x) for x in value.replace(" ", "").split("-") if x.isdigit()]
                if numbers:
                    return sum(numbers) // len(numbers)
    return None


def extract_district(address: str) -> str:
    """Определяет район из адреса 2ГИС."""
    addr_lower = address.lower()
    district_map = {
        "медеуский": "Медеуский",
        "бостандыкский": "Бостандыкский",
        "алмалинский": "Алмалинский",
        "ауэзовский": "Ауэзовский",
        "алатауский": "Алатауский",
        "наурызбайский": "Наурызбайский",
        "турксибский": "Турксибский",
        "жетысуский": "Жетысуский",
    }
    for key, val in district_map.items():
        if key in addr_lower:
            return val
    return "Алматы"


def save_venue(cur, item: dict, rubric_name: str):
    """Сохраняет заведение в таблицу venues."""
    gis_id = str(item.get("id", ""))
    point = item.get("point", {})
    lat = point.get("lat")
    lon = point.get("lon")
    address = item.get("address_name", "") or item.get("full_address_name", "") or ""

    rubrics = [r.get("name", "") for r in item.get("rubrics", [])]
    reviews = item.get("reviews", {})
    org = item.get("org", {})

    avg_check = extract_avg_check(item)

    phones = []
    for contact in item.get("contact_groups", []):
        for c in contact.get("contacts", []):
            if c.get("type") == "phone":
                phones.append(c.get("value", ""))

    cur.execute("""
        INSERT INTO venues (
            gis_id, name, address, district, lat, lon,
            rubric_primary, rubric_all, rating, review_count,
            avg_check, phones, website, schedule, branch_count
        ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        ON CONFLICT (gis_id) DO UPDATE SET
            rating = EXCLUDED.rating,
            review_count = EXCLUDED.review_count,
            avg_check = COALESCE(EXCLUDED.avg_check, venues.avg_check),
            parsed_at = NOW()
    """, (
        gis_id,
        item.get("name", ""),
        address,
        extract_district(address),
        lat, lon,
        rubric_name,
        Json(rubrics),
        reviews.get("general_rating"),
        reviews.get("general_review_count", 0),
        avg_check,
        Json(phones),
        item.get("website", ""),
        Json(item.get("schedule", {})),
        org.get("branch_count", 1),
    ))


def save_infrastructure(cur, item: dict, rubric_name: str, category: str):
    """Сохраняет инфраструктурный объект."""
    gis_id = str(item.get("id", ""))
    point = item.get("point", {})
    address = item.get("address_name", "") or ""

    extra = {}
    # Для остановок — маршруты
    if category == "transport":
        routes = []
        for route in item.get("routes", []):
            routes.append(route.get("name", ""))
        extra["routes"] = routes

    cur.execute("""
        INSERT INTO infrastructure (gis_id, name, category, subcategory, lat, lon, address, extra)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (
        gis_id,
        item.get("name", ""),
        category,
        rubric_name,
        point.get("lat"),
        point.get("lon"),
        address,
        Json(extra),
    ))


def save_building(cur, item: dict):
    """Сохраняет жилой дом для расчёта населения."""
    gis_id = str(item.get("id", ""))
    point = item.get("point", {})
    address = item.get("address_name", "") or ""

    # Этажность из атрибутов
    floors = None
    apartments_count = None
    for group in item.get("attribute_groups", []):
        for attr in group.get("attributes", []):
            name = attr.get("name", "").lower()
            value = attr.get("value", "")
            if "этаж" in name:
                try:
                    floors = int(value)
                except (ValueError, TypeError):
                    pass
            if "квартир" in name:
                try:
                    apartments_count = int(value)
                except (ValueError, TypeError):
                    pass

    # Оценка населения
    est_population = None
    if apartments_count:
        est_population = round(apartments_count * 2.6)
    elif floors:
        # Типовой дом: ~500м² этаж × этажность × 0.7 жилая площадь / 27.4 м²/чел
        total_area = floors * 500 * 0.7
        est_population = round(total_area / SQ_M_PER_PERSON)

    cur.execute("""
        INSERT INTO buildings (gis_id, address, lat, lon, floors, apartments_count, est_population, building_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (
        gis_id,
        address,
        point.get("lat"),
        point.get("lon"),
        floors,
        apartments_count,
        est_population,
        "многоквартирный",
    ))


def main():
    parser = argparse.ArgumentParser(description="Парсер 2ГИС")
    parser.add_argument("--limit", type=int, default=0, help="Лимит объектов на рубрику (0 = все)")
    parser.add_argument("--rubric", type=str, default="", help="Парсить только эту рубрику (название)")
    args = parser.parse_args()

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        log.error("DATABASE_URL не установлен")
        sys.exit(1)

    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    total = 0
    rubrics_to_parse = RUBRICS
    if args.rubric:
        rubrics_to_parse = [r for r in RUBRICS if args.rubric.lower() in r["name"].lower()]

    for rubric in rubrics_to_parse:
        rubric_id = rubric["rubric_id"]
        name = rubric["name"]
        table = rubric["table"]
        category = rubric.get("category", "")

        log.info(f"=== {name} (rubric {rubric_id}) → {table} ===")
        page = 1
        count = 0

        while True:
            data = fetch_items(rubric_id, page=page)
            result = data.get("result", {})
            items = result.get("items", [])
            total_count = result.get("total", 0)

            if not items:
                break

            for item in items:
                if not item.get("point"):
                    continue

                if table == "venues":
                    save_venue(cur, item, name)
                elif table == "infrastructure":
                    save_infrastructure(cur, item, name, category)
                elif table == "buildings":
                    save_building(cur, item)

                count += 1
                total += 1

                if args.limit and count >= args.limit:
                    break

            log.info(f"  Страница {page}: +{len(items)} (всего {count}/{total_count})")

            if args.limit and count >= args.limit:
                break

            if page * 50 >= total_count:
                break

            page += 1
            time.sleep(1)

        log.info(f"  Итого {name}: {count}")

    log.info(f"Всего сохранено: {total}")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
