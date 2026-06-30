const { neon } = require('@neondatabase/serverless')

let sql = null
let dbReady = false

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
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

async function query(text, params = []) {
  const rows = await getSql().query(text, params)
  return { rows: Array.isArray(rows) ? rows : [rows] }
}

async function ensureDb() {
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

module.exports = { query, ensureDb }
