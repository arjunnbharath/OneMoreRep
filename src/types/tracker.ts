export interface WorkoutSet {
  id: string
  reps: number
  weight?: number
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
  exercises: TrackedExercise[]
}
