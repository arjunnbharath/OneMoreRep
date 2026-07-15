import type { TrackedExercise, WorkoutSession, WorkoutSet } from '../types/tracker'

export function estimate1RM(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export function workingSets(sets: WorkoutSet[]) {
  return sets.filter((s) => !s.isWarmup)
}

export function setVolume(set: WorkoutSet) {
  if (set.isWarmup) return 0
  return (set.weight ?? 0) * set.reps
}

export function exerciseVolume(exercise: TrackedExercise) {
  return exercise.sets.reduce((sum, s) => sum + setVolume(s), 0)
}

export function sessionVolume(session: WorkoutSession) {
  return session.exercises.reduce((sum, ex) => sum + exerciseVolume(ex), 0)
}

export function bestSetInExercise(exercise: TrackedExercise) {
  let best = { weight: 0, reps: 0, est1RM: 0 }
  for (const set of workingSets(exercise.sets).filter((s) => s.completed)) {
    const w = set.weight ?? 0
    const est = estimate1RM(w, set.reps)
    if (est > best.est1RM) best = { weight: w, reps: set.reps, est1RM: est }
  }
  return best
}

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

export function findLastExerciseLog(
  sessions: WorkoutSession[],
  exerciseName: string,
): TrackedExercise | null {
  const target = normalizeName(exerciseName)
  for (const session of sessions) {
    const match = session.exercises.find((e) => normalizeName(e.name) === target)
    if (match && match.sets.some((s) => s.completed)) return match
  }
  return null
}

export function formatLastPerformance(exercise: TrackedExercise) {
  const completed = workingSets(exercise.sets).filter((s) => s.completed)
  if (completed.length === 0) return null
  const top = completed.reduce((best, set) => {
    const est = estimate1RM(set.weight ?? 0, set.reps)
    const bestEst = estimate1RM(best.weight ?? 0, best.reps)
    return est > bestEst ? set : best
  })
  if (top.weight) return `${top.weight} kg × ${top.reps}`
  return `${top.reps} reps`
}

export interface ExerciseHistoryPoint {
  date: string
  est1RM: number
  volume: number
  label: string
}

export function getExerciseHistory(
  sessions: WorkoutSession[],
  exerciseName: string,
): ExerciseHistoryPoint[] {
  const target = normalizeName(exerciseName)
  const points: ExerciseHistoryPoint[] = []

  for (const session of [...sessions].reverse()) {
    const ex = session.exercises.find((e) => normalizeName(e.name) === target)
    if (!ex) continue
    const best = bestSetInExercise(ex)
    if (best.est1RM <= 0 && exerciseVolume(ex) <= 0) continue
    points.push({
      date: session.date,
      est1RM: best.est1RM,
      volume: exerciseVolume(ex),
      label: new Date(session.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    })
  }

  return points
}

export function detectSessionPRs(
  session: WorkoutSession,
  pastSessions: WorkoutSession[],
): string[] {
  const prs: string[] = []

  for (const exercise of session.exercises) {
    const current = bestSetInExercise(exercise)
    if (current.est1RM <= 0) continue

    let previousBest = 0
    for (const past of pastSessions) {
      if (past.id === session.id) continue
      const prevEx = past.exercises.find(
        (e) => normalizeName(e.name) === normalizeName(exercise.name),
      )
      if (!prevEx) continue
      const best = bestSetInExercise(prevEx)
      previousBest = Math.max(previousBest, best.est1RM)
    }

    if (current.est1RM > previousBest) {
      prs.push(exercise.name)
    }
  }

  return prs
}

export function getLoggedExerciseNames(sessions: WorkoutSession[]) {
  const names = new Set<string>()
  for (const session of sessions) {
    for (const ex of session.exercises) {
      names.add(ex.name)
    }
  }
  return [...names].sort()
}

export function getSessionDurationSeconds(session: WorkoutSession) {
  const start = new Date(session.startedAt ?? session.date).getTime()
  const end = session.completedAt
    ? new Date(session.completedAt).getTime()
    : Date.now()
  return Math.max(0, Math.floor((end - start) / 1000))
}

export interface PeriodProgressPoint {
  key: string
  label: string
  sessions: number
  volume: number
  minutes: number
}

function toDateKeyFromDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const weekday = d.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeeklyProgress(
  sessions: WorkoutSession[],
  weekCount = 8,
): PeriodProgressPoint[] {
  const now = new Date()
  const buckets = new Map<string, PeriodProgressPoint>()

  for (let i = weekCount - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const start = startOfWeek(d)
    const key = toDateKeyFromDate(start)
    buckets.set(key, {
      key,
      label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: 0,
      volume: 0,
      minutes: 0,
    })
  }

  for (const session of sessions) {
    const key = toDateKeyFromDate(startOfWeek(new Date(session.date)))
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.sessions += 1
    bucket.volume += sessionVolume(session)
    bucket.minutes += Math.max(1, Math.floor(getSessionDurationSeconds(session) / 60))
  }

  return [...buckets.values()]
}

export function getMonthlyProgress(
  sessions: WorkoutSession[],
  monthCount = 6,
): PeriodProgressPoint[] {
  const now = new Date()
  const buckets = new Map<string, PeriodProgressPoint>()

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, {
      key,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      sessions: 0,
      volume: 0,
      minutes: 0,
    })
  }

  for (const session of sessions) {
    const d = new Date(session.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.sessions += 1
    bucket.volume += sessionVolume(session)
    bucket.minutes += Math.max(1, Math.floor(getSessionDurationSeconds(session) / 60))
  }

  return [...buckets.values()]
}
