import type { NavigateFunction } from 'react-router-dom'
import type { ExerciseGroup } from '../data/exerciseGuides'
import type { TourStep } from './tourTypes'
import { getTodayWeekday, WEEKDAY_LABELS } from './workoutPlan'
import { TRACKER_PATHS } from './trackerPaths'

interface AppTourActions {
  navigate: NavigateFunction
}

const TOUR_PLAN_MUSCLE: ExerciseGroup = 'chest'

function getVisibleMainNavSelector(): string {
  const mobileNav = document.querySelector('[data-tour="main-nav-mobile"]')
  if (mobileNav) {
    const rect = mobileNav.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return '[data-tour="main-nav-mobile"]'
    }
  }
  return '[data-tour="main-nav-desktop"]'
}

function getVisibleTrackerNavSelector(): string {
  const mobileNav = document.querySelector('[data-tour-nav="mobile"]')
  if (mobileNav) {
    const rect = mobileNav.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return '[data-tour-nav="mobile"]'
    }
  }
  return '[data-tour-nav="desktop"]'
}

function getVisibleTrackerTabSelector(tabTourId: string): string {
  const mobileNav = document.querySelector('[data-tour-nav="mobile"]')
  if (mobileNav) {
    const rect = mobileNav.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return `[data-tour-nav="mobile"] [data-tour="${tabTourId}"]`
    }
  }
  return `[data-tour-nav="desktop"] [data-tour="${tabTourId}"]`
}

function getVisibleExerciseLibrarySelector(): string | undefined {
  const desktopLink = document.querySelector('[data-tour="main-nav-exercises"]')
  if (desktopLink) {
    const rect = desktopLink.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return '[data-tour="main-nav-exercises"]'
    }
  }

  const homeLibrary = document.querySelector('[data-tour="home-exercise-library"]')
  if (homeLibrary) {
    const rect = homeLibrary.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return '[data-tour="home-exercise-library"]'
    }
  }

  if (document.querySelector('[data-tour="exercise-muscle-groups"]')) {
    return '[data-tour="exercise-muscle-groups"]'
  }

  return '[data-tour="exercise-library"]'
}

export function createAppTourSteps({ navigate }: AppTourActions): TourStep[] {
  const today = getTodayWeekday()
  const todayLabel = WEEKDAY_LABELS[today]

  return [
    {
      id: 'welcome',
      title: 'Welcome to OneMoreRep',
      body: 'Plan workouts, log sets, and track calories — all in one place. This quick tour takes under a minute.',
      placement: 'center',
      onEnter: () => navigate('/home'),
    },
    {
      id: 'home-stats',
      title: 'Your stats at a glance',
      body: 'Streak, training time, sessions, and calories — updated as you train.',
      target: '[data-tour="home-stats"]',
      placement: 'bottom',
      onEnter: () => navigate('/home'),
    },
    {
      id: 'home-today-plan',
      title: "Today's workout",
      body: `See what's planned for ${todayLabel}. Swipe the card right to start instantly.`,
      target: '[data-tour="home-today-plan"]',
      placement: 'bottom',
      onEnter: () => navigate('/home'),
    },
    {
      id: 'main-nav',
      title: 'Get around fast',
      body: 'Jump between Home, Calories, Progress, Exercises, and Profile from here.',
      getTarget: () => getVisibleMainNavSelector(),
      placement: 'top',
      tooltipGap: 16,
    },
    {
      id: 'tracker-tabs',
      title: 'Your training hub',
      body: 'Plans, Workout, Stats, and Friends live under Progress.',
      getTarget: () => getVisibleTrackerNavSelector(),
      placement: 'bottom',
      onEnter: () => navigate(TRACKER_PATHS.plan),
    },
    {
      id: 'plan-week',
      title: 'Build your weekly plan',
      body: 'See your full week at a glance. Tap any day to plan muscle groups and exercises.',
      target: '[data-tour="plan-week-grid"]',
      placement: 'bottom',
      tooltipGap: 20,
      onEnter: () => navigate(TRACKER_PATHS.plan),
    },
    {
      id: 'plan-day',
      title: 'Add muscle groups',
      body: `Open a day and pick the muscles you want to train. Let's set up ${todayLabel}.`,
      getTarget: () => {
        if (document.querySelector('[data-tour="plan-add-muscle"]')) {
          return '[data-tour="plan-add-muscle"]'
        }
        if (document.querySelector('[data-tour="plan-day-header"]')) {
          return '[data-tour="plan-day-header"]'
        }
        return '[data-tour="plan-week-grid"]'
      },
      placement: 'bottom',
      tooltipGap: 20,
      onEnter: () => navigate(TRACKER_PATHS.planDay(today)),
    },
    {
      id: 'plan-add-exercise',
      title: 'Add exercises',
      body: 'Browse exercises for each muscle group and tap the green + button to add them to your plan.',
      getTarget: () => {
        if (document.querySelector('[data-tour="plan-add-exercises"]')) {
          return '[data-tour="plan-add-exercises"]'
        }
        if (document.querySelector('[data-tour="plan-add-exercise-btn"]')) {
          return '[data-tour="plan-add-exercise-btn"]'
        }
        if (document.querySelector('[data-tour="plan-muscle-header"]')) {
          return '[data-tour="plan-muscle-header"]'
        }
        return undefined
      },
      placement: 'top',
      tooltipGap: 16,
      onEnter: () => navigate(TRACKER_PATHS.planMuscle(today, TOUR_PLAN_MUSCLE)),
    },
    {
      id: 'workout-ready',
      title: 'Workout & sets',
      body: 'Start a session from here. During a workout, enter weight and reps, then tap the checkmark on each set.',
      getTarget: () => {
        if (document.querySelector('[data-tour="set-complete-btn"]')) {
          return '[data-tour="set-complete-btn"]'
        }
        if (document.querySelector('[data-tour="workout-ready"]')) {
          return '[data-tour="workout-ready"]'
        }
        return getVisibleTrackerTabSelector('tracker-tab-workout')
      },
      placement: 'bottom',
      tooltipGap: 20,
      onEnter: () => navigate(TRACKER_PATHS.workout),
    },
    {
      id: 'stats',
      title: 'Watch your progress',
      body: 'Volume, PRs, training time, and exercise trends — all in Stats.',
      getTarget: () =>
        document.querySelector('[data-tour="stats-overview"]')
          ? '[data-tour="stats-overview"]'
          : getVisibleTrackerTabSelector('tracker-tab-stats'),
      placement: 'bottom',
      tooltipGap: 20,
      onEnter: () => navigate(TRACKER_PATHS.progress),
    },
    {
      id: 'exercise-library',
      title: 'Exercise library',
      body: 'Select Exercises to browse the full workout library — every exercise with demos, form tips, and muscle-group filters.',
      getTarget: () => getVisibleExerciseLibrarySelector(),
      placement: 'bottom',
      tooltipGap: 16,
      onEnter: () => navigate('/home'),
    },
    {
      id: 'calories',
      title: 'Track nutrition',
      body: 'Log meals and stay on top of calories, protein, carbs, and fat.',
      getTarget: () =>
        document.querySelector('[data-tour="calorie-summary"]')
          ? '[data-tour="calorie-summary"]'
          : undefined,
      placement: 'bottom',
      onEnter: () => navigate('/calories'),
    },
    {
      id: 'finish',
      title: "You're all set",
      body: 'Build your plan, log your sets, and track your progress. Replay this tour anytime from Settings.',
      placement: 'center',
      onEnter: () => navigate('/home'),
    },
  ]
}
