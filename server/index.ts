import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { initDb } from './db.js'
import authRoutes from './routes/auth.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)

async function start() {
  try {
    await initDb()
    console.log('Database connected and tables ready')
  } catch (err) {
    console.error('Database init failed:', err)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
  })
}

start()
