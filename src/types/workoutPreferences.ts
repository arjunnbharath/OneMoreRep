export type TrainingDays = 3 | 4 | 5 | 6

export type TrainingExperience = 'new' | 'under_1y' | '1_3y' | '3plus'

export type TrainingGoal = 'muscle' | 'strength' | 'fat_loss' | 'general'

export type SplitType =
  | 'full_body_3'
  | 'upper_lower_4'
  | 'upper_lower_6'
  | 'ppl_cycle_4'
  | 'ppl_flex_5'
  | 'ppl_hybrid_5'
  | 'ppl_x2_6'
  | 'bro_split_7'

export interface WorkoutPreferences {
  onboarded: boolean
  daysPerWeek?: TrainingDays
  experience?: TrainingExperience
  goal?: TrainingGoal
  splitType?: SplitType
}

export interface PlanOnboardingAnswers {
  daysPerWeek: TrainingDays
  experience: TrainingExperience
  goal: TrainingGoal
}
