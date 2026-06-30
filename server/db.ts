import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

let poolInstance: pg.Pool | null = null
let dbReady = false

function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  }

  return poolInstance
}

export const pool = {
  query: (...args: Parameters<pg.Pool['query']>) => getPool().query(...args),
}

export async function ensureDb() {
  if (dbReady) return

  await getPool().query(`
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
