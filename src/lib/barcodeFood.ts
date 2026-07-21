import type { FoodItem } from '../types/nutrition'
import { lookupFoodByBarcode as apiLookupFoodByBarcode } from './api'

export interface ScannedFood extends FoodItem {
  suggestedServingGrams?: number
}

export async function lookupFoodByBarcode(
  token: string,
  scanValue: string,
): Promise<ScannedFood | null> {
  const normalized = scanValue.trim()
  if (!normalized) return null

  try {
    const { food } = await apiLookupFoodByBarcode(token, normalized)
    return food
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Food lookup failed')
  }
}
