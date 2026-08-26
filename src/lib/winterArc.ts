import type { WorkoutSession } from '../types/tracker'
import type { WeeklyPlan } from '../types/workoutPlan'
import type {
  WinterArcDailyTask,
  WinterArcProgress,
  WinterArcState,
  WinterArcTask,
} from '../types/winterArc'
import { computeStreak, toDateKey } from '../pages/home/homeUtils'
import { exerciseGroupLabels } from '../data/exerciseGuides'
import {
  getTodayWeekday,
  muscleExerciseCount,
  WEEKDAY_LABELS,
} from './workoutPlan'

export const WINTER_ARC_DURATION_DAYS = 90
export const DEFAULT_WINTER_ARC_WEEKLY_TARGET = 4
export const WORKOUT_TASK_ID = '__workout__'
export const SUGAR_CUT_TASK_ID = '__sugar_cut__'

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
    const stamp = session.completedAt ?? session.date
    const key = toDateKey(new Date(stamp))
    return key >= state.enrolledAt! && key <= endDateKey
  })

  const weekKeys = getCurrentWeekKeySet(today)
  const workoutsThisWeek = arcSessions.filter((session) => {
    const stamp = session.completedAt ?? session.date
    return weekKeys.has(toDateKey(new Date(stamp)))
  }).length

  const weeklyTarget = state.workoutsPerWeek
  const trainedToday = arcSessions.some((session) => {
    const stamp = session.completedAt ?? session.date
    return toDateKey(new Date(stamp)) === todayKey
  })

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

function workoutCompletedOnDate(sessions: WorkoutSession[], dateKey: string) {
  return sessions.some((session) => {
    const stamp = session.completedAt ?? session.date
    return toDateKey(new Date(stamp)) === dateKey
  })
}

export function getTodayWorkoutSummary(plan: WeeklyPlan) {
  const today = getTodayWeekday()
  const dayPlan = plan[today]
  const muscles = dayPlan.muscles.filter((group) => muscleExerciseCount(dayPlan, group) > 0)
  const exerciseTotal = muscles.reduce(
    (sum, group) => sum + muscleExerciseCount(dayPlan, group),
    0,
  )

  if (muscles.length === 0) {
    return {
      today,
      muscles: [] as typeof muscles,
      exerciseTotal: 0,
      title: 'Open workout',
      subtitle: 'No plan for today — train anyway or update your weekly plan',
    }
  }

  const muscleLabels = muscles.map((group) => exerciseGroupLabels[group]).join(', ')
  return {
    today,
    muscles,
    exerciseTotal,
    title: `${WEEKDAY_LABELS[today]} · ${muscleLabels}`,
    subtitle:
      exerciseTotal > 0
        ? `${exerciseTotal} exercise${exerciseTotal === 1 ? '' : 's'} from your plan`
        : 'From your weekly plan',
  }
}

export function getDailyTasks(
  state: WinterArcState,
  sessions: WorkoutSession[],
  plan: WeeklyPlan,
  dateKey = toDateKey(new Date()),
): WinterArcDailyTask[] {
  const workoutSummary = getTodayWorkoutSummary(plan)
  const trainedToday = workoutCompletedOnDate(sessions, dateKey)
  const completedIds = state.completedByDate[dateKey] ?? []

  const workoutTask: WinterArcDailyTask = {
    id: WORKOUT_TASK_ID,
    kind: 'workout',
    label: trainedToday ? 'Workout done' : workoutSummary.title,
    completed: trainedToday,
  }

  const sugarTask: WinterArcDailyTask = {
    id: SUGAR_CUT_TASK_ID,
    kind: 'sugar',
    label: 'Sugar cut',
    completed: completedIds.includes(SUGAR_CUT_TASK_ID),
  }

  const habitTasks: WinterArcDailyTask[] = state.tasks.map((task) => ({
    id: task.id,
    kind: 'habit',
    label: task.label,
    completed: completedIds.includes(task.id),
  }))

  return [workoutTask, sugarTask, ...habitTasks]
}

export function summarizeDailyTasks(tasks: WinterArcDailyTask[]) {
  const completed = tasks.filter((task) => task.completed).length
  return { completed, total: tasks.length }
}

const HABIT_KIND_ORDER: Record<WinterArcDailyTask['kind'], number> = {
  workout: 0,
  sugar: 1,
  habit: 2,
}

function habitDisplayLabel(task: WinterArcDailyTask) {
  if (task.kind === 'workout') return 'Workout'
  if (task.kind === 'sugar') return 'Sugar cut'
  return task.label
}

export function getPendingHabitLabels(tasks: WinterArcDailyTask[]) {
  return tasks
    .filter((task) => !task.completed)
    .sort((a, b) => HABIT_KIND_ORDER[a.kind] - HABIT_KIND_ORDER[b.kind])
    .map(habitDisplayLabel)
}

export function normalizeWinterArcTasks(raw: unknown): WinterArcTask[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (item): item is WinterArcTask =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as WinterArcTask).id === 'string' &&
        typeof (item as WinterArcTask).label === 'string',
    )
    .map((item) => ({
      id: item.id,
      label: item.label.trim(),
    }))
    .filter((item) => item.label.length > 0)
}

export function normalizeCompletedByDate(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== 'object') return {}
  const result: Record<string, string[]> = {}
  for (const [dateKey, ids] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(ids)) continue
    result[dateKey] = ids.filter((id): id is string => typeof id === 'string')
  }
  return result
}
