import { toDateKey } from '../pages/home/homeUtils'
import type { WorkoutSession } from '../types/tracker'
import {
  bestSetInExercise,
  getSessionDurationSeconds,
  sessionVolume,
} from './workoutProgress'

export function getCurrentWeekKeys() {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toDateKey(d)
  })
}

export function formatLastActive(sessions: WorkoutSession[]): string | null {
  if (sessions.length === 0) return 'No workouts logged yet'

  const latest = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0]
  const days = Math.floor((Date.now() - new Date(latest.date).getTime()) / 86_400_000)

  if (days === 0) return 'Active today'
  if (days === 1) return 'Active yesterday'
  return `Last workout ${days} days ago`
}

export function getWorkoutDaySet(sessions: WorkoutSession[]) {
  return new Set(sessions.map((session) => toDateKey(new Date(session.date))))
}

export function getTopExercises(sessions: WorkoutSession[], limit = 3) {
  const counts = new Map<string, number>()

  for (const session of sessions) {
    const seen = new Set<string>()
    for (const exercise of session.exercises) {
      const name = exercise.name.trim()
      if (!name || seen.has(name)) continue
      seen.add(name)
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export interface PRHighlight {
  exercise: string
  weight: number
  reps: number
  est1RM: number
}

export function getPRHighlights(sessions: WorkoutSession[], limit = 3): PRHighlight[] {
  const bestByExercise = new Map<string, PRHighlight>()

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const best = bestSetInExercise(exercise)
      if (best.est1RM <= 0) continue

      const existing = bestByExercise.get(exercise.name)
      if (!existing || best.est1RM > existing.est1RM) {
        bestByExercise.set(exercise.name, {
          exercise: exercise.name,
          weight: best.weight,
          reps: best.reps,
          est1RM: best.est1RM,
        })
      }
    }
  }

  return [...bestByExercise.values()]
    .sort((a, b) => b.est1RM - a.est1RM)
    .slice(0, limit)
}

function sessionsInLastDays(sessions: WorkoutSession[], days: number) {
  const cutoff = Date.now() - days * 86_400_000
  return sessions.filter((session) => new Date(session.date).getTime() >= cutoff)
}

function currentWeekSessions(sessions: WorkoutSession[]) {
  const weekKeys = new Set(getCurrentWeekKeys())
  return sessions.filter((session) => weekKeys.has(toDateKey(new Date(session.date))))
}

export function getWeekComparison(mySessions: WorkoutSession[], friendSessions: WorkoutSession[]) {
  const mine = currentWeekSessions(mySessions)
  const theirs = currentWeekSessions(friendSessions)

  return {
    myWorkouts: mine.length,
    friendWorkouts: theirs.length,
    myVolume: mine.reduce((sum, session) => sum + sessionVolume(session), 0),
    friendVolume: theirs.reduce((sum, session) => sum + sessionVolume(session), 0),
  }
}

export function getLast7DaySessionSeries(sessions: WorkoutSession[]) {
  const days: { key: string; label: string; count: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = toDateKey(date)
    const label = date.toLocaleDateString('en-US', { weekday: 'narrow' })
    const count = sessions.filter((session) => toDateKey(new Date(session.date)) === key).length
    days.push({ key, label, count })
  }

  return days
}

export function get7DayChallenge(mySessions: WorkoutSession[], friendSessions: WorkoutSession[]) {
  const myCount = sessionsInLastDays(mySessions, 7).length
  const friendCount = sessionsInLastDays(friendSessions, 7).length

  let leader: 'you' | 'friend' | 'tie' = 'tie'
  if (myCount > friendCount) leader = 'you'
  else if (friendCount > myCount) leader = 'friend'

  return { myCount, friendCount, leader }
}

export function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export interface ActivityItem {
  id: string
  title: string
  subtitle: string
  when: string
}

export function getActivityFeed(sessions: WorkoutSession[], limit = 6): ActivityItem[] {
  return [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((session) => {
      const vol = sessionVolume(session)
      const mins = Math.floor(getSessionDurationSeconds(session) / 60)
      const parts = [
        vol > 0 ? `${vol.toLocaleString()} kg` : null,
        mins > 0 ? `${mins} min` : null,
        `${session.exercises.length} exercises`,
      ].filter(Boolean)

      return {
        id: session.id,
        title: `Logged ${session.name}`,
        subtitle: parts.join(' · '),
        when: formatRelativeTime(session.completedAt ?? session.date),
      }
    })
}
