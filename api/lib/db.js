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
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(20)
  `)
  await getSql().query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (LOWER(username))
  `)
  await getSql().query(`
    CREATE TABLE IF NOT EXISTS friendships (
      user_low INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_high INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_low, user_high),
      CHECK (user_low < user_high)
    )
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
  await getSql().query(`
    CREATE TABLE IF NOT EXISTS friend_nudges (
      id SERIAL PRIMARY KEY,
      from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nudge_type VARCHAR(32) NOT NULL,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await getSql().query(`
    CREATE INDEX IF NOT EXISTS friend_nudges_to_user_idx
    ON friend_nudges (to_user_id, created_at DESC)
  `)
  await getSql().query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await getSql().query(`
    CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions (user_id)
  `)
  dbReady = true
}

module.exports = { query, ensureDb }
