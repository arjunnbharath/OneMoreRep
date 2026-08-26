import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vercel needs absolute asset paths; Capacitor builds use relative (base: './')
const base = process.env.VERCEL ? '/' : './'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
