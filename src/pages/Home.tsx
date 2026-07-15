import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBookmarks } from '../hooks/useBookmarks'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { homeFilters, workouts, type MuscleGroup } from '../data/mockData'
import HomeDesktop from './home/HomeDesktop'
import HomeMobile from './home/HomeMobile'
import { getFeaturedWorkout, useHomeStats } from './home/homeUtils'

export default function Home() {
  const location = useLocation()
  const { user } = useAuth()
  const { sessions } = useWorkoutTracker()
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const workoutsRef = useRef<HTMLElement>(null)

  const [activeFilter, setActiveFilter] = useState<MuscleGroup | 'all'>('all')
  const [search, setSearch] = useState('')

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'
  const stats = useHomeStats(sessions)

  const filteredWorkouts = useMemo(() => {
    let list = workouts
    if (activeFilter !== 'all') {
      list = list.filter((w) => w.muscle === activeFilter)
    }
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.shortTitle?.toLowerCase().includes(q) ||
        w.muscle.includes(q),
    )
  }, [activeFilter, search])

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
    firstName,
    userName: user?.name,
    avatarUrl: user?.avatarUrl,
    stats,
    sessions,
    search,
    onSearchChange: setSearch,
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
