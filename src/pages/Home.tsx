import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useBookmarks } from '../hooks/useBookmarks'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { toLocalDateKey } from '../lib/nutritionMath'
import { homeFilters, workouts, type MuscleGroup } from '../data/mockData'
import HomeDesktop from './home/HomeDesktop'
import HomeMobile from './home/HomeMobile'
import { getFeaturedWorkout, useHomeStats } from './home/homeUtils'

export default function Home() {
  const location = useLocation()
  const { sessions } = useWorkoutTracker()
  const { caloriesByDay } = useCalorieTracker()
  const { plan } = useWorkoutPlan()
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const workoutsRef = useRef<HTMLElement>(null)

  const [activeFilter, setActiveFilter] = useState<MuscleGroup | 'all'>('all')

  const stats = useHomeStats(sessions)
  const todayCalories = caloriesByDay[toLocalDateKey()] ?? 0

  const filteredWorkouts = useMemo(() => {
    if (activeFilter === 'all') return workouts
    return workouts.filter((w) => w.muscle === activeFilter)
  }, [activeFilter])

  const featuredWorkout = useMemo(
    () => getFeaturedWorkout(filteredWorkouts),
    [filteredWorkouts],
  )

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
    activeFilter,
    onFilterChange: setActiveFilter,
    homeFilters,
    filteredWorkouts,
    isBookmarked,
    onBookmarkToggle: toggleBookmark,
    workoutsRef,
  }

  return (
    <>
      <HomeMobile {...shared} />
      <HomeDesktop {...shared} featuredWorkout={featuredWorkout} />
    </>
  )
}
