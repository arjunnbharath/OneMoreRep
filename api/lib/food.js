const { AuthError } = require('./auth.js')

function parseNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function extractBarcodeFromScan(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  const compact = raw.replace(/\s/g, '')
  if (/^\d{8,14}$/.test(compact)) return compact

  const urlPatterns = [
    /(?:product|barcode|gtin|ean)[/:=-](\d{8,14})/i,
    /[?&](?:barcode|gtin|ean)=(\d{8,14})/i,
    /\/(\d{8,14})(?:[/?#]|$)/,
  ]

  for (const pattern of urlPatterns) {
    const match = raw.match(pattern)
    if (match?.[1]) return match[1]
  }

  const sequences = raw.match(/\d{8,14}/g)
  if (sequences?.length) {
    return sequences.sort((a, b) => b.length - a.length)[0]
  }

  const digitsOnly = raw.replace(/\D/g, '')
  return digitsOnly.length >= 8 ? digitsOnly : null
}

async function lookupBarcode(scanValue) {
  const normalized = extractBarcodeFromScan(scanValue)
  if (!normalized) {
    throw new AuthError('Invalid barcode or QR code', 400)
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${normalized}.json?fields=product_name,generic_name,brands,nutriments,serving_size,serving_quantity,quantity`,
  )

  if (!response.ok) {
    throw new AuthError('Food lookup failed', 502)
  }

  const payload = await response.json()
  if (payload.status !== 1 || !payload.product) {
    throw new AuthError('Product not found', 404)
  }

  const product = payload.product
  const nutriments = product.nutriments ?? {}
  const calories =
    parseNumber(nutriments['energy-kcal_100g']) ||
    (parseNumber(nutriments.energy_100g) > 0 ? parseNumber(nutriments.energy_100g) / 4.184 : 0)

  const servingGrams = parseNumber(product.serving_quantity) || 100

  return {
    id: `off-${normalized}`,
    name: product.product_name || product.generic_name || 'Unknown product',
    brand: product.brands?.split(',')[0]?.trim() || undefined,
    caloriesPer100g: Math.round(calories * 10) / 10,
    proteinPer100g: parseNumber(nutriments.proteins_100g),
    carbsPer100g: parseNumber(nutriments.carbohydrates_100g),
    fatPer100g: parseNumber(nutriments.fat_100g),
    fiberPer100g: parseNumber(nutriments.fiber_100g) || undefined,
    isCustom: false,
    barcode: normalized,
    suggestedServingGrams: servingGrams,
  }
}

module.exports = { lookupBarcode, extractBarcodeFromScan }
