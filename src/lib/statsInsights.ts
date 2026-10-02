import { exerciseGuides, type ExerciseGroup } from '../data/exerciseGuides'
import type { WorkoutSession } from '../types/tracker'
import {
  detectSessionPRs,
  estimate1RM,
  getSessionDurationSeconds,
  sessionVolume,
  workingSets,
} from './workoutProgress'

export const STAT_MUSCLES = [
  'shoulders',
  'biceps',
  'triceps',
  'chest',
  'upperBack',
  'lowerBack',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'adductors',
  'hipFlexors',
  'calves',
  'shins',
  'forearms',
] as const

export type StatMuscle = (typeof STAT_MUSCLES)[number]

export const STAT_MUSCLE_LABELS: Record<StatMuscle, string> = {
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  chest: 'Chest',
  upperBack: 'Upper back',
  lowerBack: 'Lower back',
  abs: 'Abs',
  obliques: 'Obliques',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  adductors: 'Adductors',
  hipFlexors: 'Hip flexors',
  calves: 'Calves',
  shins: 'Shins',
  forearms: 'Forearms',
}

/** Muscles drawn on the front figure. */
export const FRONT_MUSCLES: StatMuscle[] = [
  'shoulders',
  'chest',
  'biceps',
  'forearms',
  'abs',
  'obliques',
  'hipFlexors',
  'quads',
  'adductors',
  'calves',
  'shins',
]

/** Muscles drawn on the back figure. */
export const BACK_MUSCLES: StatMuscle[] = [
  'shoulders',
  'upperBack',
  'triceps',
  'lowerBack',
  'glutes',
  'hamstrings',
  'calves',
]

const GUIDE_GROUP = new Map(
  exerciseGuides.map((exercise) => [exercise.name.trim().toLowerCase(), exercise.group]),
)

const NAME_RULES: [RegExp, StatMuscle][] = [
  [/shin|tibialis/, 'shins'],
  [/calf|calves/, 'calves'],
  [/adduct/, 'adductors'],
  [/hip flex|leg raise|knee raise/, 'hipFlexors'],
  [/tricep|pushdown|skull crusher|tricep kickback/, 'triceps'],
  [/glute|hip thrust|glute kickback/, 'glutes'],
  [/hamstring|\brdl\b|romanian|leg curl|good morning/, 'hamstrings'],
  [/squat|lunge|leg press|leg extension|\bquad/, 'quads'],
  [/oblique/, 'obliques'],
  [/\babs?\b|crunch|plank|sit-?up/, 'abs'],
  [/lower back|back extension|hyperextension/, 'lowerBack'],
  [/curl|bicep/, 'biceps'],
  [/overhead|shoulder|lateral raise|rear delt|face pull|arnold/, 'shoulders'],
  [/row|pulldown|pull-?up|chin-?up|\blat\b/, 'upperBack'],
  [/deadlift/, 'hamstrings'],
  [/bench|\bfly\b|push-?up|chest/, 'chest'],
  [/forearm|wrist/, 'forearms'],
]

const GROUP_FALLBACK: Record<ExerciseGroup, StatMuscle> = {
  chest: 'chest',
  back: 'upperBack',
  shoulders: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  abdominals: 'abs',
  legs: 'quads',
  calves: 'calves',
}

export function primaryMuscle(name: string): StatMuscle {
  const normalized = name.trim().toLowerCase()
  for (const [pattern, muscle] of NAME_RULES) {
    if (pattern.test(normalized)) return muscle
  }
  const group = GUIDE_GROUP.get(normalized)
  return group ? GROUP_FALLBACK[group] : 'chest'
}

export type MuscleRange = 'week' | '30d' | '90d' | 'all'
export type EffortRange = '30d' | '90d' | '1y' | 'all'
export type WeightRange = '1m' | '3m' | '1y' | 'all'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfWeek(date: Date) {
  const next = startOfDay(date)
  const weekday = next.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  next.setDate(next.getDate() + diff)
  return next
}

function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function rangeStart(range: MuscleRange | EffortRange | WeightRange, now = new Date()) {
  if (range === 'all') return null
  const start = startOfDay(now)
  if (range === 'week') {
    return startOfWeek(now)
  }
  const days =
    range === '30d' || range === '1m' ? 30 : range === '90d' || range === '3m' ? 90 : 365
  start.setDate(start.getDate() - (days - 1))
  return start
}

function inRange(iso: string, range: MuscleRange | EffortRange | WeightRange, now = new Date()) {
  const start = rangeStart(range, now)
  if (!start) return true
  return new Date(iso).getTime() >= start.getTime()
}

export interface FinishedSet {
  exercise: string
  muscle: StatMuscle
  reps: number
  weight: number
  rir?: number
  date: string
}

export function finishedSets(sessions: WorkoutSession[]): FinishedSet[] {
  const sets: FinishedSet[] = []
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of workingSets(exercise.sets)) {
        if (!set.completed) continue
        sets.push({
          exercise: exercise.name,
          muscle: primaryMuscle(exercise.name),
          reps: set.reps,
          weight: set.weight ?? 0,
          rir: set.rir,
          date: session.date,
        })
      }
    }
  }
  return sets
}

export interface MuscleStat {
  muscle: StatMuscle
  label: string
  sets: number
  bestKg: number
}

export function muscleStats(sessions: WorkoutSession[], range: MuscleRange): MuscleStat[] {
  const totals = new Map<StatMuscle, { sets: number; bestKg: number }>()
  for (const muscle of STAT_MUSCLES) totals.set(muscle, { sets: 0, bestKg: 0 })

  for (const set of finishedSets(sessions)) {
    if (!inRange(set.date, range)) continue
    const bucket = totals.get(set.muscle)
    if (!bucket) continue
    bucket.sets += 1
    if (set.weight > 0) {
      bucket.bestKg = Math.max(bucket.bestKg, estimate1RM(set.weight, set.reps))
    }
  }

  return STAT_MUSCLES.map((muscle) => {
    const bucket = totals.get(muscle)!
    return {
      muscle,
      label: STAT_MUSCLE_LABELS[muscle],
      sets: bucket.sets,
      bestKg: Math.round(bucket.bestKg * 10) / 10,
    }
  })
}

export interface EffortSummary {
  averageRir: number | null
  hardPercent: number | null
  rated: number
  finished: number
  weekly: { label: string; average: number | null }[]
  buckets: { label: string; count: number; percent: number }[]
}

export function effortSummary(sessions: WorkoutSession[], range: EffortRange): EffortSummary {
  const sets = finishedSets(sessions).filter((set) => inRange(set.date, range))
  const rated = sets.filter((set) => set.rir !== undefined && !Number.isNaN(set.rir))
  const averageRir =
    rated.length === 0
      ? null
      : Math.round((rated.reduce((sum, set) => sum + (set.rir ?? 0), 0) / rated.length) * 10) / 10
  const hard = rated.filter((set) => (set.rir ?? 99) <= 3).length
  const hardPercent = rated.length === 0 ? null : Math.round((hard / rated.length) * 100)

  const weekBuckets = new Map<string, { label: string; sum: number; count: number }>()
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i * 7)
    const start = startOfWeek(day)
    weekBuckets.set(dateKey(start), {
      label: start.toLocaleDateString('en-US', { month: 'short' }),
      sum: 0,
      count: 0,
    })
  }
  for (const set of rated) {
    const key = dateKey(startOfWeek(new Date(set.date)))
    const bucket = weekBuckets.get(key)
    if (!bucket) continue
    bucket.sum += set.rir ?? 0
    bucket.count += 1
  }

  const labels = ['RIR 0', 'RIR 1', 'RIR 2', 'RIR 3', 'RIR 4+']
  const counts = [0, 0, 0, 0, 0]
  for (const set of rated) {
    const rir = set.rir ?? 0
    const index = rir <= 0 ? 0 : rir < 2 ? 1 : rir < 3 ? 2 : rir < 4 ? 3 : 4
    counts[index] += 1
  }

  return {
    averageRir,
    hardPercent,
    rated: rated.length,
    finished: sets.length,
    weekly: [...weekBuckets.values()].map((bucket) => ({
      label: bucket.label,
      average: bucket.count === 0 ? null : Math.round((bucket.sum / bucket.count) * 10) / 10,
    })),
    buckets: labels.map((label, index) => ({
      label,
      count: counts[index],
      percent: rated.length === 0 ? 0 : Math.round((counts[index] / rated.length) * 100),
    })),
  }
}

export interface ActivityWeek {
  month: string | null
  days: { key: string; value: number; isToday: boolean; inFuture: boolean }[]
}

export function activityGrid(
  sessions: WorkoutSession[],
  metric: 'time' | 'volume',
): { weeks: ActivityWeek[]; max: number } {
  const byDay = new Map<string, number>()
  for (const session of sessions) {
    const key = dateKey(new Date(session.date))
    const value =
      metric === 'volume'
        ? sessionVolume(session)
        : Math.max(1, Math.round(getSessionDurationSeconds(session) / 60))
    byDay.set(key, (byDay.get(key) ?? 0) + value)
  }

  const today = startOfDay(new Date())
  const end = startOfWeek(today)
  end.setDate(end.getDate() + 6)
  const cursor = startOfWeek(today)
  cursor.setDate(cursor.getDate() - 51 * 7)

  const weeks: ActivityWeek[] = []
  let max = 0
  let lastMonth = -1

  while (cursor.getTime() <= end.getTime()) {
    const month = cursor.getMonth()
    const showMonth = month !== lastMonth
    lastMonth = month
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(cursor)
      day.setDate(cursor.getDate() + index)
      const key = dateKey(day)
      const value = byDay.get(key) ?? 0
      max = Math.max(max, value)
      return {
        key,
        value,
        isToday: key === dateKey(today),
        inFuture: day.getTime() > today.getTime(),
      }
    })
    weeks.push({
      month: showMonth ? cursor.toLocaleDateString('en-US', { month: 'short' }) : null,
      days,
    })
    cursor.setDate(cursor.getDate() + 7)
  }

  return { weeks, max }
}

export function heatLevel(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0
  const ratio = value / max
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 0.75) return 3
  return 4
}

export interface RecentWorkout {
  id: string
  name: string
  dateLabel: string
  durationLabel: string
  sets: number
  volume: number
  prs: number
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
}

export function recentWorkouts(sessions: WorkoutSession[]): RecentWorkout[] {
  return sessions.map((session, index) => {
    const sets = session.exercises.reduce(
      (sum, exercise) => sum + workingSets(exercise.sets).filter((set) => set.completed).length,
      0,
    )
    const prs = detectSessionPRs(session, sessions.slice(index + 1)).length
    const when = new Date(session.date)
    return {
      id: session.id,
      name: session.name,
      dateLabel: when.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      durationLabel: formatDuration(getSessionDurationSeconds(session)),
      sets,
      volume: Math.round(sessionVolume(session)),
      prs,
    }
  })
}

export interface ExerciseLogSet {
  weight: number
  reps: number
  rir?: number
}

export interface ExerciseLog {
  id: string
  date: string
  weekday: string
  day: string
  month: string
  sets: ExerciseLogSet[]
  bestWeight: number
  bestRir?: number
}

export function exerciseLogs(sessions: WorkoutSession[], exerciseName: string): ExerciseLog[] {
  const target = exerciseName.trim().toLowerCase()
  const logs: ExerciseLog[] = []

  for (const session of sessions) {
    const exercise = session.exercises.find((item) => item.name.trim().toLowerCase() === target)
    if (!exercise) continue
    const sets = workingSets(exercise.sets)
      .filter((set) => set.completed)
      .map((set) => ({ weight: set.weight ?? 0, reps: set.reps, rir: set.rir }))
    if (sets.length === 0) continue
    const best = sets.reduce((top, set) => (set.weight > top.weight ? set : top), sets[0])
    const when = new Date(session.date)
    logs.push({
      id: session.id,
      date: session.date,
      weekday: when.toLocaleDateString('en-US', { weekday: 'short' }),
      day: String(when.getDate()),
      month: when.toLocaleDateString('en-US', { month: 'short' }),
      sets,
      bestWeight: best.weight,
      bestRir: best.rir,
    })
  }

  return logs
}

export function formatSetLine(set: ExerciseLogSet) {
  const load = set.weight > 0 ? `${trimNumber(set.weight)}×${set.reps}` : `${set.reps} reps`
  return set.rir === undefined ? load : `${load} (RIR ${trimNumber(set.rir)})`
}

export function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10)
}
