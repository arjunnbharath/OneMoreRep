import type { FoodItem } from '../types/nutrition'
import type { macrosForGrams } from './nutritionMath'

type MacroPreview = ReturnType<typeof macrosForGrams>

export function formatNutritionPer100g(food: FoodItem) {
  const parts = [
    `${food.caloriesPer100g} kcal`,
    `Protein ${food.proteinPer100g}g`,
    `Carbs ${food.carbsPer100g}g`,
    `Fat ${food.fatPer100g}g`,
  ]

  if (food.sugarPer100g !== undefined) parts.push(`Sugar ${food.sugarPer100g}g`)
  if (food.fiberPer100g !== undefined) parts.push(`Fiber ${food.fiberPer100g}g`)
  if (food.saturatedFatPer100g !== undefined) parts.push(`Sat. fat ${food.saturatedFatPer100g}g`)
  if (food.saltPer100g !== undefined) parts.push(`Salt ${food.saltPer100g}g`)

  return parts.join(' · ')
}

export function formatMacroPreview(preview: MacroPreview) {
  const parts = [
    `${preview.calories} kcal`,
    `Protein ${preview.protein}g`,
    `Carbs ${preview.carbs}g`,
    `Fat ${preview.fat}g`,
  ]

  if (preview.sugar !== undefined) parts.push(`Sugar ${preview.sugar}g`)
  if (preview.fiber !== undefined) parts.push(`Fiber ${preview.fiber}g`)
  if (preview.saturatedFat !== undefined) parts.push(`Sat. fat ${preview.saturatedFat}g`)
  if (preview.salt !== undefined) parts.push(`Salt ${preview.salt}g`)

  return parts.join(' · ')
}
