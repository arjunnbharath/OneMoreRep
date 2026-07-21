import { Router } from 'express'
import { createRequire } from 'node:module'
import { AuthError } from '../auth-bridge.js'

const require = createRequire(import.meta.url)
const { getUserIdFromAuthHeader } = require('../../api/lib/friends.js')
const { lookupBarcode, searchFood } = require('../../api/lib/food.js')

const router = Router()

async function handleLookup(req: import('express').Request, res: import('express').Response) {
  try {
    await getUserIdFromAuthHeader(req.headers.authorization)
    const code = String(req.query.code ?? req.params.code ?? '').trim()
    if (!code) {
      res.status(400).json({ error: 'Barcode or QR code is required' })
      return
    }

    const food = await lookupBarcode(code)
    res.json({ food })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Barcode lookup error:', err)
    res.status(500).json({ error: 'Failed to look up barcode' })
  }
}

router.get('/barcode', handleLookup)
router.get('/barcode/:code', handleLookup)

async function handleSearch(req: import('express').Request, res: import('express').Response) {
  try {
    await getUserIdFromAuthHeader(req.headers.authorization)
    const q = String(req.query.q ?? '').trim()
    if (!q) {
      res.status(400).json({ error: 'Search query is required' })
      return
    }

    const foods = await searchFood(q)
    res.json({ foods })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Food search error:', err)
    res.status(500).json({ error: 'Failed to search foods' })
  }
}

router.get('/search', handleSearch)

export default router
