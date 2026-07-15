const path = require('path')
const fs = require('fs')
const { neon } = require('@neondatabase/serverless')

let sql = null
let dbReady = false

function loadEnvFile() {
  const hasUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL

  if (hasUrl) return

  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath })
  }
}

function getDatabaseUrl() {
  loadEnvFile()

  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your .env file locally, or to Vercel → Settings → Environment Variables, then redeploy.',
    )
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
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await getSql().query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT
  `)
  await getSql().query(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data_key VARCHAR(64) NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, data_key)
    )
  `)
  dbReady = true
}

module.exports = { query, ensureDb }
