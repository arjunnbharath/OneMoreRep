import type { ExerciseGroup } from '../data/exerciseGuides'
import { exerciseGroupLabels } from '../data/exerciseGuides'
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

const MUSCLE_IMAGES: Record<ExerciseGroup, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  back: 'https://images.unsplash.com/photo-1603286561831-8f228e251213?w=800&q=80',
  shoulders: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
  biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  triceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  abdominals: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b46d2?w=800&q=80',
  legs: 'https://images.unsplash.com/photo-1434682881348-1deda2a010f5?w=800&q=80',
  calves: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
}

const WEEKDAY_IMAGES: Record<Weekday, string> = {
  monday: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  tuesday: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  wednesday: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  thursday: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
  friday: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  saturday: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  sunday: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b46d2?w=800&q=80',
}

export function imageForDayPlan(day: Weekday, dayPlan: DayPlan): string {
  const firstMuscle = dayPlan.muscles[0]
  if (firstMuscle) return MUSCLE_IMAGES[firstMuscle]
  return WEEKDAY_IMAGES[day]
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
