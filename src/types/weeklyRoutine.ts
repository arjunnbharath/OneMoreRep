export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export interface RoutineExercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export type WeeklyRoutine = Record<Weekday, RoutineExercise[]>
