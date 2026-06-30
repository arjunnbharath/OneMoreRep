const { ensureDb } = require('./lib/db.cjs')

module.exports = async function handler(_req, res) {
  try {
    await ensureDb()
    return res.status(200).json({ ok: true, database: 'connected' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database check failed'
    return res.status(500).json({ ok: false, error: message })
  }
}
