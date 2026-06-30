import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureDb } from '../../lib/db'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDb()
    return res.json({ ok: true, database: 'connected' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database check failed'
    return res.status(500).json({ ok: false, error: message })
  }
}
