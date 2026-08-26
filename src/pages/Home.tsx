import { useMemo } from 'react'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { useWinterArc } from '../hooks/useWinterArc'
import { toLocalDateKey } from '../lib/nutritionMath'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { computeWinterArcProgress, getDailyTasks, summarizeDailyTasks } from '../lib/winterArc'
import HomeDesktop from './home/HomeDesktop'
import HomeMobile from './home/HomeMobile'
import { useHomeStats } from './home/homeUtils'

export default function Home() {
  const { sessions } = useWorkoutTracker()
  const { caloriesByDay } = useCalorieTracker()
  const { plan } = useWorkoutPlan()
  const { state: winterArcState } = useWinterArc()

  const stats = useHomeStats(sessions)
  const todayCalories = caloriesByDay[toLocalDateKey()] ?? 0

  const winterArcProgress = useMemo(
    () => computeWinterArcProgress(sessions, winterArcState),
    [sessions, winterArcState],
  )

  const winterArcTaskSummary = useMemo(() => {
    if (!winterArcState.enrolled) return { completed: 0, total: 0 }
    return summarizeDailyTasks(getDailyTasks(winterArcState, sessions, plan))
  }, [winterArcState, sessions, plan])

  const showWinterArc =
    winterArcState.enrolled && winterArcState.showOnHome && winterArcProgress !== null

  const shared = {
    stats,
    sessionCount: sessions.length,
    todayCalories,
    sessions,
    plan,
    showWinterArc,
    winterArcProgress,
    winterArcTaskSummary,
  }

  return (
    <>
      <HomeMobile {...shared} />
      <HomeDesktop {...shared} />
    </>
  )
}
