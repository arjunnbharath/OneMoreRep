import 'dotenv/config'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ensureDb } = require('../api/lib/db.js')

export async function initDb() {
  await ensureDb()
}
