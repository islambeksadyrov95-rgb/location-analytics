import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  }
  return pool;
}

export async function query(text: string, params?: unknown[]) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}
