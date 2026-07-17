import type { ExerciseGroup } from '../data/exerciseGuides'
import { getExercisesByGroup } from '../data/exerciseGuides'
import type {
  PlanOnboardingAnswers,
  SplitType,
  TrainingExperience,
  TrainingGoal,
  TrainingDays,
} from '../types/workoutPreferences'
import type { DayPlan, PlanExercise, Weekday, WeeklyPlan } from '../types/workoutPlan'
import { WEEKDAYS } from '../types/workoutPlan'
import { emptyWeeklyPlan } from './workoutPlan'

const PUSH: ExerciseGroup[] = ['chest', 'shoulders', 'triceps']
const PULL: ExerciseGroup[] = ['back', 'biceps']
const LEGS: ExerciseGroup[] = ['legs', 'calves']
const UPPER: ExerciseGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps']
const LOWER: ExerciseGroup[] = ['legs', 'calves', 'abdominals']
const FULL_BODY: ExerciseGroup[] = ['chest', 'back', 'shoulders', 'legs', 'abdominals']
const BRO_CHEST_TRI: ExerciseGroup[] = ['chest', 'triceps']
const BRO_BACK_BI: ExerciseGroup[] = ['back', 'biceps']
const BRO_LEGS: ExerciseGroup[] = ['legs', 'calves']
const SHOULDERS_ABS: ExerciseGroup[] = ['shoulders', 'abdominals']

type DaySchedule = Partial<Record<Weekday, ExerciseGroup[]>>

const SPLIT_SCHEDULES: Record<SplitType, DaySchedule> = {
  full_body_3: {
    monday: FULL_BODY,
    wednesday: FULL_BODY,
    friday: FULL_BODY,
  },
  upper_lower_4: {
    monday: UPPER,
    tuesday: LOWER,
    thursday: UPPER,
    friday: LOWER,
  },
  upper_lower_6: {
    monday: UPPER,
    tuesday: LOWER,
    wednesday: UPPER,
    thursday: LOWER,
    friday: UPPER,
    saturday: LOWER,
  },
  ppl_cycle_4: {
    monday: PUSH,
    tuesday: PULL,
    wednesday: LEGS,
    friday: PUSH,
  },
  ppl_flex_5: {
    monday: PUSH,
    tuesday: PULL,
    wednesday: LEGS,
    friday: PUSH,
    saturday: LEGS,
  },
  ppl_hybrid_5: {
    monday: PUSH,
    tuesday: PULL,
    wednesday: LEGS,
    thursday: UPPER,
    friday: LOWER,
  },
  ppl_x2_6: {
    monday: PUSH,
    tuesday: PULL,
    wednesday: LEGS,
    thursday: PUSH,
    friday: PULL,
    saturday: LEGS,
  },
  bro_split_7: {
    monday: BRO_CHEST_TRI,
    tuesday: BRO_BACK_BI,
    wednesday: BRO_LEGS,
    thursday: SHOULDERS_ABS,
    friday: BRO_CHEST_TRI,
    saturday: BRO_BACK_BI,
    sunday: [...BRO_LEGS, 'abdominals'],
  },
}

export const SPLIT_LABELS: Record<SplitType, string> = {
  full_body_3: 'Full body · 3 days',
  upper_lower_4: 'Upper / Lower · 4 days',
  upper_lower_6: 'Upper / Lower · 6 days',
  ppl_cycle_4: 'Push / Pull / Legs · 4 days',
  ppl_flex_5: 'Push / Pull / Legs · 5 days',
  ppl_hybrid_5: 'PPL + Upper/Lower · 5 days',
  ppl_x2_6: 'Push / Pull / Legs · 6 days',
  bro_split_7: 'Bro split · 7 days',
}

export const SPLIT_DESCRIPTIONS: Record<SplitType, string> = {
  full_body_3: 'Hit every major muscle group each session — great when you can only train 3× per week.',
  upper_lower_4: 'Alternate upper and lower body — balanced volume with solid recovery.',
  upper_lower_6: 'Upper/lower three times each week — more frequency without jumping straight to PPL.',
  ppl_cycle_4: 'Push, pull, legs, then repeat — muscles grouped by movement pattern.',
  ppl_flex_5: 'Classic PPL with two flex days so you hit push and legs twice in the week.',
  ppl_hybrid_5: 'PPL early in the week, then an upper/lower finish for extra volume.',
  ppl_x2_6: 'Push, pull, legs twice per week — the most common 6-day PPL setup.',
  bro_split_7: 'One or two muscle groups per day — best for advanced lifters chasing extra hypertrophy.',
}

function isBeginner(experience: TrainingExperience) {
  return experience === 'new' || experience === 'under_1y'
}

function isAdvanced(experience: TrainingExperience) {
  return experience === '3plus'
}

export function recommendSplit(answers: PlanOnboardingAnswers): SplitType {
  const { daysPerWeek, experience, goal } = answers

  if (daysPerWeek === 3) return 'full_body_3'

  if (daysPerWeek === 4) {
    if (isBeginner(experience)) return 'upper_lower_4'
    if (goal === 'strength') return 'upper_lower_4'
    return 'ppl_cycle_4'
  }

  if (daysPerWeek === 5) {
    if (isAdvanced(experience)) return 'ppl_hybrid_5'
    return 'ppl_flex_5'
  }

  // 6+ days
  if (isBeginner(experience)) return 'upper_lower_6'
  if (isAdvanced(experience) && goal === 'muscle') return 'bro_split_7'
  return 'ppl_x2_6'
}

function defaultSetsReps(goal: TrainingGoal): { sets: number; reps: number } {
  switch (goal) {
    case 'strength':
      return { sets: 4, reps: 5 }
    case 'muscle':
      return { sets: 3, reps: 10 }
    default:
      return { sets: 3, reps: 12 }
  }
}

function seedExercisesForMuscle(
  group: ExerciseGroup,
  goal: TrainingGoal,
): PlanExercise[] {
  const { sets, reps } = defaultSetsReps(goal)
  return getExercisesByGroup(group)
    .slice(0, 2)
    .map((exercise) => ({
      id: crypto.randomUUID(),
      name: exercise.name,
      sets,
      reps,
    }))
}

function buildDayPlan(muscles: ExerciseGroup[], goal: TrainingGoal): DayPlan {
  const exercises: DayPlan['exercises'] = {}
  for (const group of muscles) {
    exercises[group] = seedExercisesForMuscle(group, goal)
  }
  return { muscles: [...muscles], exercises }
}

export function buildWeeklyPlanFromSplit(
  splitType: SplitType,
  goal: TrainingGoal,
): WeeklyPlan {
  const plan = emptyWeeklyPlan()
  const schedule = SPLIT_SCHEDULES[splitType]

  for (const day of WEEKDAYS) {
    const muscles = schedule[day]
    if (muscles && muscles.length > 0) {
      plan[day] = buildDayPlan(muscles, goal)
    }
  }

  return plan
}

export function buildPlanFromAnswers(answers: PlanOnboardingAnswers): {
  splitType: SplitType
  plan: WeeklyPlan
} {
  const splitType = recommendSplit(answers)
  const plan = buildWeeklyPlanFromSplit(splitType, answers.goal)
  return { splitType, plan }
}

export function trainingDaysLabel(days: TrainingDays) {
  return days === 6 ? '6+' : String(days)
}
