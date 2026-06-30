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
      password_hash VARCHAR(255),
      auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
      oauth_sub VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await getSql().query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'local'
  `)
  await getSql().query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_sub VARCHAR(255)
  `)
  await getSql().query(`
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL
  `)
  await getSql().query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_provider_sub_idx
    ON users (auth_provider, oauth_sub)
    WHERE oauth_sub IS NOT NULL
  `)

  dbReady = true
}

module.exports = { query, ensureDb }
