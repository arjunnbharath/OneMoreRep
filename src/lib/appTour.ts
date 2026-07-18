import type { NavigateFunction } from 'react-router-dom'
import type { TourStep } from './tourTypes'
import { getTodayWeekday, WEEKDAY_LABELS } from './workoutPlan'
import { TRACKER_PATHS } from './trackerPaths'

interface AppTourActions {
  navigate: NavigateFunction
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

export function createAppTourSteps({ navigate }: AppTourActions): TourStep[] {
  const today = getTodayWeekday()
  const todayLabel = WEEKDAY_LABELS[today]

  return [
    {
      id: 'welcome',
      title: 'Welcome to OneMoreRep',
      body: 'A quick tour of how to plan workouts, log sets, and track nutrition.',
      placement: 'center',
      onEnter: () => navigate('/home'),
    },
    {
      id: 'home-stats',
      title: 'Your dashboard',
      body: 'See your streak, training time, sessions, and calorie intake at a glance.',
      target: '[data-tour="home-stats"]',
      placement: 'bottom',
      onEnter: () => navigate('/home'),
    },
    {
      id: 'home-today-plan',
      title: "Today's workout",
      body: `Your plan for ${todayLabel} lives here. Swipe right on the card to start instantly.`,
      target: '[data-tour="home-today-plan"]',
      placement: 'bottom',
      onEnter: () => navigate('/home'),
    },
    {
      id: 'main-nav',
      title: 'Navigate the app',
      body: 'Use the menu to jump between Home, Calories, Progress, Exercises, and Profile.',
      getTarget: () =>
        document.querySelector('[data-tour="main-nav-mobile"]')
          ? '[data-tour="main-nav-mobile"]'
          : '[data-tour="main-nav-desktop"]',
      placement: 'top',
    },
    {
      id: 'tracker-tabs',
      title: 'Progress hub',
      body: 'Inside Progress, switch between Plans, Workout, Stats, and Friends.',
      target: '[data-tour="tracker-nav"]',
      placement: 'bottom',
      onEnter: () => navigate(TRACKER_PATHS.plan),
    },
    {
      id: 'swipe-start',
      title: 'Slide to start',
      body: `Swipe the ${todayLabel} card to the right to launch that day's workout.`,
      target: `[data-tour-plan-day="${today}"]`,
      placement: today === 'saturday' || today === 'sunday' ? 'top' : 'bottom',
      tooltipGap: 20,
      onEnter: () => navigate(TRACKER_PATHS.plan),
    },
    {
      id: 'workout-ready',
      title: 'Start a workout',
      body: "Open the Workout tab to start today's plan, repeat a session, or log a custom workout.",
      getTarget: () => getVisibleTrackerTabSelector('tracker-tab-workout'),
      placement: 'bottom',
      tooltipGap: 28,
      onEnter: () => navigate(TRACKER_PATHS.workout),
    },
    {
      id: 'log-sets',
      title: 'Log your sets',
      body: 'Enter weight and reps, then tap the checkmark when you finish each set. A rest timer starts automatically.',
      getTarget: () =>
        document.querySelector('[data-tour="set-complete-btn"]')
          ? '[data-tour="set-complete-btn"]'
          : undefined,
      placement: 'top',
      onEnter: () => navigate(TRACKER_PATHS.workout),
    },
    {
      id: 'stats',
      title: 'Track progress',
      body: 'Open the Stats tab to see lifetime volume, training time, PRs, and exercise trends.',
      getTarget: () => getVisibleTrackerTabSelector('tracker-tab-stats'),
      placement: 'bottom',
      tooltipGap: 28,
      onEnter: () => navigate(TRACKER_PATHS.progress),
    },
    {
      id: 'calories',
      title: 'Calorie tracking',
      body: 'Log meals and monitor daily calories, protein, carbs, and fat against your targets.',
      getTarget: () =>
        document.querySelector('[data-tour="calorie-summary"]')
          ? '[data-tour="calorie-summary"]'
          : undefined,
      placement: 'bottom',
      onEnter: () => navigate('/calories'),
    },
  ]
}
