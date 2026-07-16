import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { toLocalDateKey } from '../lib/nutritionMath'
import HomeDesktop from './home/HomeDesktop'
import HomeMobile from './home/HomeMobile'
import { useHomeStats } from './home/homeUtils'

export default function Home() {
  const location = useLocation()
  const { sessions } = useWorkoutTracker()
  const { caloriesByDay } = useCalorieTracker()
  const { plan } = useWorkoutPlan()
  const workoutsRef = useRef<HTMLElement>(null)

  const stats = useHomeStats(sessions)
  const todayCalories = caloriesByDay[toLocalDateKey()] ?? 0

  useEffect(() => {
    if (location.hash === '#workouts') {
      workoutsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  const shared = {
    stats,
    todayCalories,
    sessions,
    plan,
    workoutsRef,
  }

  return (
    <>
      <HomeMobile {...shared} />
      <HomeDesktop {...shared} />
    </>
  )
}
