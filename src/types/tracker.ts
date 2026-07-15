export interface WorkoutSet {
  id: string
  reps: number
  weight?: number
  completed?: boolean
  isWarmup?: boolean
}

export interface TrackedExercise {
  id: string
  name: string
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  id: string
  name: string
  date: string
  startedAt?: string
  completedAt?: string
  note?: string
  exercises: TrackedExercise[]
}
