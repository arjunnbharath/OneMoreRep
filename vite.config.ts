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
  build: {
    // TensorFlow / jsPDF / xlsx are inherently large even when split
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'tensorflow',
              test: /node_modules\/(@tensorflow|@tensorflow-models)/,
            },
            {
              name: 'jspdf',
              test: /node_modules\/jspdf/,
            },
            {
              name: 'xlsx',
              test: /node_modules\/xlsx/,
            },
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|react-router-dom|react-router)/,
            },
          ],
        },
      },
    },
  },
})
