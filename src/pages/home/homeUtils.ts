import type { WorkoutSession } from '../types/tracker'
import type { Workout } from '../data/mockData'

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

export function useHomeStats(sessions: WorkoutSession[]) {
  const completed = sessions.length
  const minutes =
    completed > 0
      ? sessions.reduce((sum, s) => sum + Math.max(s.exercises.length * 8, 15), 0)
      : 0
  const streak = computeStreak(sessions.map((s) => s.date))
  return { completed, minutes, streak }
}

export function getFeaturedWorkout(list: Workout[]) {
  if (list.length === 0) return null
  return [...list].sort((a, b) => b.rating - a.rating)[0]
}
