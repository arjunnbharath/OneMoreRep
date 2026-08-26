export interface WinterArcTask {
  id: string
  label: string
}

export interface WinterArcState {
  enrolled: boolean
  enrolledAt: string | null
  workoutsPerWeek: number
  showOnHome: boolean
  tasks: WinterArcTask[]
  completedByDate: Record<string, string[]>
}

export const DEFAULT_WINTER_ARC_STATE: WinterArcState = {
  enrolled: false,
  enrolledAt: null,
  workoutsPerWeek: 4,
  showOnHome: true,
  tasks: [],
  completedByDate: {},
}

export interface WinterArcProgress {
  dayNumber: number
  totalDays: number
  daysRemaining: number
  workoutsThisWeek: number
  weeklyTarget: number
  weeklyMet: boolean
  totalWorkouts: number
  streak: number
  trainedToday: boolean
  arcComplete: boolean
  progressPercent: number
  endDateKey: string
}

export interface WinterArcDailyTask {
  id: string
  label: string
  kind: 'workout' | 'sugar' | 'custom'
  completed: boolean
  subtitle?: string
}

export interface SugarCutDayInput {
  sugarByDay: Record<string, number>
  loggedDays: Set<string>
}
