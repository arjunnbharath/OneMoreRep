import type { FoodItem } from '../types/nutrition'
import { searchFoodOnline as apiSearchFoodOnline } from './api'

export async function searchFoodOnline(token: string, query: string): Promise<FoodItem[]> {
  const q = query.trim()
  if (!q) return []

  try {
    const { foods } = await apiSearchFoodOnline(token, q)
    return foods
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Food search failed')
  }
}
