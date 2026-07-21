import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { commonFoods } from '../data/commonFoods'
import { lookupFoodByBarcode as lookupBarcodeFood } from '../lib/barcodeFood'
import { extractBarcodeFromScan } from '../lib/barcodeScan'
import {
  calculateBmr,
  calculateCalorieTarget,
  calculateMacroTargets,
  calculateTdee,
  macrosForGrams,
  toLocalDateKey,
} from '../lib/nutritionMath'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'
import type {
  ActivityLevel,
  DailyMacroTotals,
  FoodItem,
  FoodLogEntry,
  GoalType,
  MealType,
  Sex,
  UserNutritionProfile,
} from '../types/nutrition'

const LEGACY_PROFILE_KEY = 'onemorerep-nutrition-profile'
const LEGACY_LOGS_KEY = 'onemorerep-food-logs'
const LEGACY_CUSTOM_FOODS_KEY = 'onemorerep-custom-foods'

function createId() {
  return crypto.randomUUID()
}

export function useCalorieTracker() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [profile, setProfile] = useState<UserNutritionProfile | null>(null)
  const [logs, setLogs] = useState<FoodLogEntry[]>([])
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([])
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey())
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setProfile(null)
      setLogs([])
      setCustomFoods([])
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    Promise.all([
      loadUserDataValue<UserNutritionProfile | null>(
        userId,
        token,
        USER_DATA_KEYS.nutritionProfile,
        null,
        LEGACY_PROFILE_KEY,
      ),
      loadUserDataValue<FoodLogEntry[]>(
        userId,
        token,
        USER_DATA_KEYS.foodLogs,
        [],
        LEGACY_LOGS_KEY,
      ),
      loadUserDataValue<FoodItem[]>(
        userId,
        token,
        USER_DATA_KEYS.customFoods,
        [],
        LEGACY_CUSTOM_FOODS_KEY,
      ),
    ]).then(([loadedProfile, loadedLogs, loadedCustomFoods]) => {
      if (cancelled || activeUserRef.current !== userId) return
      setProfile(loadedProfile)
      setLogs(loadedLogs)
      setCustomFoods(loadedCustomFoods)
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.nutritionProfile, profile)
  }, [profile, userId, token, ready])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.foodLogs, logs)
  }, [logs, userId, token, ready])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.customFoods, customFoods)
  }, [customFoods, userId, token, ready])

  const allFoods = useMemo(() => [...commonFoods, ...customFoods], [customFoods])

  const dayLogs = useMemo(
    () =>
      logs.filter((entry) => toLocalDateKey(new Date(entry.loggedAt)) === selectedDate),
    [logs, selectedDate],
  )

  const dayTotals = useMemo<DailyMacroTotals>(() => {
    return dayLogs.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }, [dayLogs])

  const recentFoodIds = useMemo(() => {
    const seen = new Set<string>()
    const ids: string[] = []
    for (const log of logs) {
      if (!seen.has(log.foodItemId)) {
        seen.add(log.foodItemId)
        ids.push(log.foodItemId)
      }
      if (ids.length >= 20) break
    }
    return ids
  }, [logs])

  const recentFoods = useMemo(
    () =>
      recentFoodIds
        .map((id) => allFoods.find((f) => f.id === id))
        .filter((f): f is FoodItem => Boolean(f)),
    [recentFoodIds, allFoods],
  )

  const setupProfile = useCallback(
    (input: {
      age: number
      sex: Sex
      heightCm: number
      weightKg: number
      activityLevel: ActivityLevel
      goalType: GoalType
      dailyCalorieTarget?: number
    }) => {
      const bmr = calculateBmr(input.sex, input.weightKg, input.heightCm, input.age)
      const tdee = calculateTdee(bmr, input.activityLevel)
      const { target: calculated } = calculateCalorieTarget(tdee, input.goalType, input.sex)
      const target = input.dailyCalorieTarget ?? calculated
      const macros = calculateMacroTargets(target, input.weightKg)

      const next: UserNutritionProfile = {
        ...input,
        dailyCalorieTarget: Math.round(target),
        proteinTargetG: macros.protein,
        carbsTargetG: macros.carbs,
        fatTargetG: macros.fat,
        onboarded: true,
      }
      setProfile(next)
      return next
    },
    [],
  )

  const updateGoals = useCallback((updates: Partial<UserNutritionProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const addCustomFood = useCallback((food: Omit<FoodItem, 'id' | 'isCustom'>) => {
    const item: FoodItem = { ...food, id: createId(), isCustom: true }
    setCustomFoods((prev) => [item, ...prev])
    return item
  }, [])

  const logFood = useCallback(
    (input: {
      food: FoodItem
      mealType: MealType
      quantityGrams: number
      dateKey?: string
    }) => {
      const { food, mealType, quantityGrams } = input
      if (quantityGrams <= 0) return null

      const macros = macrosForGrams(food, quantityGrams)
      const dateKey = input.dateKey ?? selectedDate
      const [y, m, d] = dateKey.split('-').map(Number)
      const loggedAt = new Date(y, m - 1, d, 12, 0, 0).toISOString()

      const entry: FoodLogEntry = {
        id: createId(),
        foodItemId: food.id,
        name: food.name,
        brand: food.brand,
        loggedAt,
        mealType,
        quantityGrams,
        ...macros,
      }
      setLogs((prev) => [entry, ...prev])
      return entry
    },
    [selectedDate],
  )

  const removeLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const searchFoods = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase()
      if (!q) return allFoods.slice(0, 16)
      return allFoods.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.brand?.toLowerCase().includes(q) ||
          f.barcode?.includes(q.replace(/\D/g, '')),
      )
    },
    [allFoods],
  )

  const lookupFoodByBarcode = useCallback(
    async (scanValue: string) => {
      if (!token) return null

      const normalized = extractBarcodeFromScan(scanValue)
      if (!normalized) return null

      const existing = allFoods.find((food) => food.barcode === normalized)
      if (existing) return existing

      const scanned = await lookupBarcodeFood(token, scanValue)
      if (!scanned) return null

      const item: FoodItem = {
        id: scanned.id,
        name: scanned.name,
        brand: scanned.brand,
        caloriesPer100g: scanned.caloriesPer100g,
        proteinPer100g: scanned.proteinPer100g,
        carbsPer100g: scanned.carbsPer100g,
        fatPer100g: scanned.fatPer100g,
        fiberPer100g: scanned.fiberPer100g,
        isCustom: false,
        barcode: scanned.barcode,
        suggestedServingGrams: scanned.suggestedServingGrams,
      }

      setCustomFoods((prev) => {
        if (prev.some((food) => food.id === item.id || food.barcode === item.barcode)) {
          return prev
        }
        return [item, ...prev]
      })

      return item
    },
    [token, allFoods],
  )

  const caloriesByDay = useMemo(() => {
    const map: Record<string, number> = {}
    for (const entry of logs) {
      const key = toLocalDateKey(new Date(entry.loggedAt))
      map[key] = (map[key] ?? 0) + entry.calories
    }
    return map
  }, [logs])

  return {
    profile,
    logs,
    dayLogs,
    dayTotals,
    caloriesByDay,
    selectedDate,
    setSelectedDate,
    allFoods,
    recentFoods,
    ready,
    setupProfile,
    updateGoals,
    addCustomFood,
    logFood,
    removeLog,
    searchFoods,
    lookupFoodByBarcode,
  }
}
