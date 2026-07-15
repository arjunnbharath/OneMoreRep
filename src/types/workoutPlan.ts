import type { ExerciseGroup } from '../data/exerciseGuides'

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export interface PlanExercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export interface DayPlan {
  muscles: ExerciseGroup[]
  exercises: Partial<Record<ExerciseGroup, PlanExercise[]>>
}

export type WeeklyPlan = Record<Weekday, DayPlan>
