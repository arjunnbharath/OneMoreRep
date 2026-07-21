import type { FoodItem } from '../types/nutrition'
import { lookupFoodByBarcode as apiLookupFoodByBarcode } from './api'

export interface ScannedFood extends FoodItem {
  suggestedServingGrams?: number
}

export async function lookupFoodByBarcode(
  token: string,
  barcode: string,
): Promise<ScannedFood | null> {
  const normalized = barcode.replace(/\D/g, '')
  if (!normalized) return null

  try {
    const { food } = await apiLookupFoodByBarcode(token, normalized)
    return food
  } catch {
    return null
  }
}
