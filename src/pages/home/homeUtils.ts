import type { WorkoutSession } from '../../types/tracker'
import type { Workout } from '../../data/mockData'

export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function computeStreak(dates: string[]) {
  if (dates.length === 0) return 0
  const uniqueDays = [...new Set(dates.map((d) => toDateKey(new Date(d))))].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    if (uniqueDays.includes(toDateKey(expected))) streak++
    else break
  }
  return streak
}

function getCurrentWeekKeySet() {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)
  return new Set(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return toDateKey(d)
    }),
  )
}

export function useHomeStats(sessions: WorkoutSession[]) {
  const weekKeys = getCurrentWeekKeySet()
  const thisWeek = sessions.filter((s) => weekKeys.has(toDateKey(new Date(s.date)))).length
  const streak = computeStreak(sessions.map((s) => s.date))
  return { streak, thisWeek }
}

export function getFeaturedWorkout(list: Workout[]) {
  if (list.length === 0) return null
  return [...list].sort((a, b) => b.rating - a.rating)[0]
}
