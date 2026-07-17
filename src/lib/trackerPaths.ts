import type { ExerciseGroup } from '../data/exerciseGuides'
import type { Weekday } from '../types/workoutPlan'
import { WEEKDAYS } from '../types/workoutPlan'
import { PLAN_GROUPS } from './workoutPlan'

export type TrackerView = 'workout' | 'plan' | 'progress' | 'friends'

export const TRACKER_PATHS = {
  root: '/tracker',
  workout: '/tracker/workout',
  workoutHistory: '/tracker/workout/history',
  plan: '/tracker/plan',
  planDay: (day: Weekday) => `/tracker/plan/${day}`,
  planMuscle: (day: Weekday, muscle: ExerciseGroup) => `/tracker/plan/${day}/${muscle}`,
  progress: '/tracker/progress',
  friends: '/tracker/friends',
  friend: (id: number) => `/tracker/friends/${id}`,
  friendNotifications: '/tracker/friends/notifications',
} as const

export type TrackerRoute =
  | { kind: 'redirect'; to: string }
  | { kind: 'workout'; history: boolean }
  | { kind: 'plan'; day?: Weekday; muscle?: ExerciseGroup }
  | { kind: 'progress' }
  | { kind: 'friends'; notifications?: boolean; friendId?: number }

function isWeekday(value: string): value is Weekday {
  return (WEEKDAYS as readonly string[]).includes(value)
}

function isExerciseGroup(value: string): value is ExerciseGroup {
  return PLAN_GROUPS.includes(value as ExerciseGroup)
}

export function parseTrackerRoute(pathname: string): TrackerRoute {
  const path = pathname.replace(/\/+$/, '') || TRACKER_PATHS.root

  if (path === TRACKER_PATHS.friendNotifications) {
    return { kind: 'friends', notifications: true }
  }

  const friendMatch = path.match(/^\/tracker\/friends\/(\d+)$/)
  if (friendMatch) {
    const id = Number(friendMatch[1])
    if (Number.isInteger(id) && id > 0) {
      return { kind: 'friends', friendId: id }
    }
  }

  if (path === TRACKER_PATHS.friends) {
    return { kind: 'friends' }
  }

  if (path === TRACKER_PATHS.workoutHistory) {
    return { kind: 'workout', history: true }
  }

  if (path === TRACKER_PATHS.workout) {
    return { kind: 'workout', history: false }
  }

  if (path === TRACKER_PATHS.progress) {
    return { kind: 'progress' }
  }

  if (path === TRACKER_PATHS.plan) {
    return { kind: 'plan' }
  }

  const planMatch = path.match(/^\/tracker\/plan\/([^/]+)(?:\/([^/]+))?$/)
  if (planMatch) {
    const daySeg = planMatch[1]
    const muscleSeg = planMatch[2]
    const day = isWeekday(daySeg) ? daySeg : undefined
    const muscle = muscleSeg && isExerciseGroup(muscleSeg) ? muscleSeg : undefined

    if (!day) return { kind: 'redirect', to: TRACKER_PATHS.plan }
    if (muscleSeg && !muscle) return { kind: 'redirect', to: TRACKER_PATHS.planDay(day) }
    return { kind: 'plan', day, muscle }
  }

  if (path === TRACKER_PATHS.root) {
    return { kind: 'redirect', to: TRACKER_PATHS.plan }
  }

  return { kind: 'redirect', to: TRACKER_PATHS.plan }
}

export function trackerViewPath(view: TrackerView): string {
  switch (view) {
    case 'workout':
      return TRACKER_PATHS.workout
    case 'plan':
      return TRACKER_PATHS.plan
    case 'progress':
      return TRACKER_PATHS.progress
    case 'friends':
      return TRACKER_PATHS.friends
  }
}

export function getTrackerView(route: TrackerRoute): TrackerView | null {
  if (route.kind === 'workout') return 'workout'
  if (route.kind === 'plan') return 'plan'
  if (route.kind === 'progress') return 'progress'
  if (route.kind === 'friends') return 'friends'
  return null
}

export function getFriendIdFromPath(pathname: string): number | null {
  const route = parseTrackerRoute(pathname)
  if (route.kind === 'friends' && route.friendId) return route.friendId
  return null
}
