const { AuthError } = require('./auth.js')

function parseNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

async function lookupBarcode(barcode) {
  const normalized = String(barcode ?? '').replace(/\D/g, '')
  if (!normalized || normalized.length < 8) {
    throw new AuthError('Invalid barcode', 400)
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

module.exports = { lookupBarcode }
