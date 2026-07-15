import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set in .env')
  process.exit(1)
}

console.log('DATABASE_URL is set:', url.replace(/:[^:@]+@/, ':****@'))

try {
  const sql = neon(url)
  const rows = await sql`SELECT 1 AS ok`
  console.log('Database connection OK:', rows)
} catch (err) {
  console.error('Database connection FAILED:', err.message)
  process.exit(1)
}
