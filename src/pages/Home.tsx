import { useMemo } from 'react'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { useWinterArc } from '../hooks/useWinterArc'
import { toLocalDateKey } from '../lib/nutritionMath'
import {
  computeSugarCutStreak,
  loggedFoodDaysFromLogs,
} from '../lib/sugarCut'
import { computeWinterArcProgress } from '../lib/winterArc'
import HomeDesktop from './home/HomeDesktop'
import HomeMobile from './home/HomeMobile'
import { useHomeStats } from './home/homeUtils'

export default function Home() {
  const { sessions } = useWorkoutTracker()
  const { caloriesByDay, sugarByDay, logs } = useCalorieTracker()
  const { plan } = useWorkoutPlan()
  const { state: winterArcState } = useWinterArc()

  const stats = useHomeStats(sessions)
  const todayCalories = caloriesByDay[toLocalDateKey()] ?? 0

  const sugarCutStreak = useMemo(
    () => computeSugarCutStreak(sugarByDay, loggedFoodDaysFromLogs(logs)),
    [sugarByDay, logs],
  )

  const winterArcProgress = useMemo(
    () => computeWinterArcProgress(sessions, winterArcState),
    [sessions, winterArcState],
  )

  const showWinterArc =
    winterArcState.enrolled && winterArcState.showOnHome && winterArcProgress !== null

  const shared = {
    stats,
    sessionCount: sessions.length,
    todayCalories,
    sugarCutStreak,
    sessions,
    plan,
    showWinterArc,
    winterArcProgress,
  }

  return (
    <>
      <HomeMobile {...shared} />
      <HomeDesktop {...shared} />
    </>
  )
}
