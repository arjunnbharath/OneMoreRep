export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type GoalType = 'cut' | 'maintain' | 'bulk'

export type Sex = 'male' | 'female'

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active'

export interface FoodItem {
  id: string
  name: string
  brand?: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  isCustom: boolean
  barcode?: string
}

export interface FoodLogEntry {
  id: string
  foodItemId: string
  name: string
  brand?: string
  loggedAt: string
  mealType: MealType
  quantityGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface UserNutritionProfile {
  age: number
  sex: Sex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goalType: GoalType
  dailyCalorieTarget: number
  proteinTargetG: number
  carbsTargetG: number
  fatTargetG: number
  onboarded: boolean
}

export interface DailyMacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}
