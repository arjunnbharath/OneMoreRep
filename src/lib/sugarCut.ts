import { toLocalDateKey } from './nutritionMath'
import { toDateKey } from '../pages/home/homeUtils'
import type { FoodLogEntry } from '../types/nutrition'

export const DEFAULT_SUGAR_LIMIT_G = 25

export function sugarByDayFromLogs(logs: FoodLogEntry[]) {
  const map: Record<string, number> = {}
  for (const entry of logs) {
    const key = toLocalDateKey(new Date(entry.loggedAt))
    map[key] = (map[key] ?? 0) + (entry.sugar ?? 0)
  }
  return map
}

export function loggedFoodDaysFromLogs(logs: FoodLogEntry[]) {
  const days = new Set<string>()
  for (const entry of logs) {
    days.add(toLocalDateKey(new Date(entry.loggedAt)))
  }
  return days
}

export function computeSugarCutStreak(
  sugarByDay: Record<string, number>,
  loggedDays: Set<string>,
  limitG = DEFAULT_SUGAR_LIMIT_G,
) {
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toDateKey(d)

    if (!loggedDays.has(key)) {
      if (i === 0) continue
      break
    }

    const sugar = sugarByDay[key] ?? 0
    if (sugar <= limitG) streak++
    else break
  }

  return streak
}
