import { Router } from 'express'
import { createRequire } from 'node:module'
import { AuthError } from '../auth-bridge.js'

const require = createRequire(import.meta.url)
const { getUserIdFromAuthHeader } = require('../../api/lib/friends.js')
const { lookupBarcode } = require('../../api/lib/food.js')

const router = Router()

router.get('/barcode/:code', async (req, res) => {
  try {
    await getUserIdFromAuthHeader(req.headers.authorization)
    const food = await lookupBarcode(req.params.code)
    res.json({ food })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Barcode lookup error:', err)
    res.status(500).json({ error: 'Failed to look up barcode' })
  }
})

export default router
