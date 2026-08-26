export interface WinterArcState {
  enrolled: boolean
  enrolledAt: string | null
  workoutsPerWeek: number
  showOnHome: boolean
}

export const DEFAULT_WINTER_ARC_STATE: WinterArcState = {
  enrolled: false,
  enrolledAt: null,
  workoutsPerWeek: 4,
  showOnHome: true,
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
