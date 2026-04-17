"""Инициализация схемы БД в Neon PostgreSQL."""
import os
import psycopg2

def main():
    db_url = os.environ["DATABASE_URL"]
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as f:
        sql = f.read()

    cur.execute(sql)
    print("Schema initialized successfully.")

    # Проверка таблиц
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
    """)
    tables = [row[0] for row in cur.fetchall()]
    print(f"Tables: {', '.join(tables)}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
