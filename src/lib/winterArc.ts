import type { WorkoutSession } from '../types/tracker'
import type { WinterArcProgress, WinterArcState } from '../types/winterArc'
import { computeStreak, toDateKey } from '../pages/home/homeUtils'

export const WINTER_ARC_DURATION_DAYS = 90
export const DEFAULT_WINTER_ARC_WEEKLY_TARGET = 4

function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function getCurrentWeekKeySet(reference = new Date()) {
  const mondayOffset = (reference.getDay() + 6) % 7
  const monday = new Date(reference)
  monday.setDate(reference.getDate() - mondayOffset)
  return new Set(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return toDateKey(d)
    }),
  )
}

export function computeWinterArcProgress(
  sessions: WorkoutSession[],
  state: WinterArcState,
): WinterArcProgress | null {
  if (!state.enrolled || !state.enrolledAt) return null

  const start = parseDateKey(state.enrolledAt)
  const end = addDays(start, WINTER_ARC_DURATION_DAYS - 1)
  const endDateKey = toDateKey(end)
  const today = new Date()
  const todayKey = toDateKey(today)

  const elapsedDays =
    Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const dayNumber = Math.min(Math.max(elapsedDays, 1), WINTER_ARC_DURATION_DAYS)
  const arcComplete = todayKey > endDateKey || dayNumber >= WINTER_ARC_DURATION_DAYS

  const arcSessions = sessions.filter((session) => {
    const key = toDateKey(new Date(session.date))
    return key >= state.enrolledAt! && key <= endDateKey
  })

  const weekKeys = getCurrentWeekKeySet(today)
  const workoutsThisWeek = arcSessions.filter((session) =>
    weekKeys.has(toDateKey(new Date(session.date))),
  ).length

  const weeklyTarget = state.workoutsPerWeek
  const trainedToday = arcSessions.some(
    (session) => toDateKey(new Date(session.date)) === todayKey,
  )

  const daysRemaining = arcComplete
    ? 0
    : Math.max(0, WINTER_ARC_DURATION_DAYS - dayNumber)

  return {
    dayNumber,
    totalDays: WINTER_ARC_DURATION_DAYS,
    daysRemaining,
    workoutsThisWeek,
    weeklyTarget,
    weeklyMet: workoutsThisWeek >= weeklyTarget,
    totalWorkouts: arcSessions.length,
    streak: computeStreak(sessions.map((session) => session.date)),
    trainedToday,
    arcComplete,
    progressPercent: Math.round((dayNumber / WINTER_ARC_DURATION_DAYS) * 100),
    endDateKey,
  }
}

export function formatWinterArcEndDate(endDateKey: string) {
  return parseDateKey(endDateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
