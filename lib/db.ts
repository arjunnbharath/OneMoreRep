import { neon } from '@neondatabase/serverless'

let sql: ReturnType<typeof neon> | null = null
let dbReady = false

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  const parsed = new URL(url)
  parsed.searchParams.delete('channel_binding')
  return parsed.toString()
}

function getSql() {
  if (!sql) {
    sql = neon(getDatabaseUrl())
  }
  return sql
}

export const pool = {
  async query<T = Record<string, unknown>>(
    text: string,
    params: unknown[] = [],
  ): Promise<{ rows: T[] }> {
    const rows = await getSql().query(text, params)
    return { rows: (Array.isArray(rows) ? rows : [rows]) as T[] }
  },
}

export async function ensureDb() {
  if (dbReady) return

  await getSql().query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  dbReady = true
}

export async function initDb() {
  await ensureDb()
}
