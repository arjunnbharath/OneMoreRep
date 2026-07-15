import type { ExerciseGroup } from '../data/exerciseGuides'
import { exerciseGroupLabels } from '../data/exerciseGuides'
import { getCalendarDayImage } from '../data/calendarDayImages'
import type { DayPlan, PlanExercise, Weekday, WeeklyPlan } from '../types/workoutPlan'
import { WEEKDAYS } from '../types/workoutPlan'

export const PLAN_GROUPS: ExerciseGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'abdominals',
  'calves',
]

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export function imageForDayPlan(day: Weekday, _dayPlan?: DayPlan): string {
  return getCalendarDayImage(day)
}

export function emptyDayPlan(): DayPlan {
  return { muscles: [], exercises: {} }
}

export function emptyWeeklyPlan(): WeeklyPlan {
  return {
    monday: emptyDayPlan(),
    tuesday: emptyDayPlan(),
    wednesday: emptyDayPlan(),
    thursday: emptyDayPlan(),
    friday: emptyDayPlan(),
    saturday: emptyDayPlan(),
    sunday: emptyDayPlan(),
  }
}

export function getTodayWeekday(): Weekday {
  const index = new Date().getDay()
  const map: Weekday[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return map[index]
}

export function groupLabel(group: ExerciseGroup) {
  return exerciseGroupLabels[group]
}

export function exercisesForMuscle(day: DayPlan, group: ExerciseGroup): PlanExercise[] {
  return day.exercises[group] ?? []
}

export function muscleExerciseCount(day: DayPlan, group: ExerciseGroup) {
  return exercisesForMuscle(day, group).length
}

export function dayHasPlan(day: DayPlan) {
  return day.muscles.length > 0
}

export function daysWithPlan(plan: WeeklyPlan) {
  return WEEKDAYS.filter((d) => dayHasPlan(plan[d]))
}

export function muscleQueueForDay(day: DayPlan): ExerciseGroup[] {
  return day.muscles.filter((g) => muscleExerciseCount(day, g) > 0)
}

export function normalizeWeeklyPlan(raw: unknown): WeeklyPlan {
  const base = emptyWeeklyPlan()
  if (!raw || typeof raw !== 'object') return base

  const record = raw as Record<string, unknown>
  if (!('monday' in record)) return base

  for (const day of WEEKDAYS) {
    const dayRaw = record[day]
    if (!dayRaw || typeof dayRaw !== 'object') continue

    const dayObj = dayRaw as { muscles?: unknown; exercises?: unknown }
    const muscles = Array.isArray(dayObj.muscles)
      ? dayObj.muscles.filter((m): m is ExerciseGroup =>
          typeof m === 'string' && (PLAN_GROUPS as string[]).includes(m),
        )
      : []

    const exercises: DayPlan['exercises'] = {}
    if (dayObj.exercises && typeof dayObj.exercises === 'object') {
      for (const group of PLAN_GROUPS) {
        const list = (dayObj.exercises as Record<string, unknown>)[group]
        if (!Array.isArray(list)) continue
        exercises[group] = list
          .filter((item): item is PlanExercise => {
            return (
              !!item &&
              typeof item === 'object' &&
              typeof (item as PlanExercise).id === 'string' &&
              typeof (item as PlanExercise).name === 'string'
            )
          })
          .map((item) => ({
            id: item.id,
            name: item.name,
            sets: Math.max(1, Number(item.sets) || 1),
            reps: Math.max(1, Number(item.reps) || 1),
            weight: item.weight ? Number(item.weight) : undefined,
          }))
      }
    }

    base[day] = { muscles, exercises }
  }

  return base
}
