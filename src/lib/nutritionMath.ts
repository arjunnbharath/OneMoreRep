import type { ActivityLevel, GoalType, Sex } from '../types/nutrition'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

export function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateTdee(bmr: number, activity: ActivityLevel) {
  return bmr * ACTIVITY_MULTIPLIERS[activity]
}

export function calculateCalorieTarget(
  tdee: number,
  goalType: GoalType,
  sex: Sex,
): { target: number; warning?: string } {
  let target = tdee
  if (goalType === 'cut') target = tdee - 500
  if (goalType === 'bulk') target = tdee + 400

  const floor = sex === 'female' ? 1200 : 1500
  if (target < floor) {
    return {
      target: floor,
      warning: `Target was adjusted to ${floor} kcal minimum for safety.`,
    }
  }
  return { target: Math.round(target) }
}

export function calculateMacroTargets(
  calorieTarget: number,
  weightKg: number,
): { protein: number; fat: number; carbs: number } {
  const protein = Math.round(weightKg * 2)
  const fat = Math.round((calorieTarget * 0.27) / 9)
  const carbs = Math.round((calorieTarget - protein * 4 - fat * 9) / 4)
  return { protein, fat, carbs: Math.max(0, carbs) }
}

export function macrosForGrams(
  food: {
    caloriesPer100g: number
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    fiberPer100g?: number
    sugarPer100g?: number
    saturatedFatPer100g?: number
    saltPer100g?: number
  },
  grams: number,
) {
  const factor = grams / 100
  const scale = (value: number) => Math.round(value * factor * 10) / 10

  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: scale(food.proteinPer100g),
    carbs: scale(food.carbsPer100g),
    fat: scale(food.fatPer100g),
    fiber: food.fiberPer100g !== undefined ? scale(food.fiberPer100g) : undefined,
    sugar: food.sugarPer100g !== undefined ? scale(food.sugarPer100g) : undefined,
    saturatedFat:
      food.saturatedFatPer100g !== undefined ? scale(food.saturatedFatPer100g) : undefined,
    salt: food.saltPer100g !== undefined ? scale(food.saltPer100g) : undefined,
  }
}

export function toLocalDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
