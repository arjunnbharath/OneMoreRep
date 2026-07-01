import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Clock,
  Dumbbell,
  Flame,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import { useAuth } from '../context/AuthContext'
import { useBookmarks } from '../hooks/useBookmarks'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import {
  heroImage,
  homeFilters,
  motivationImage,
  workouts,
  type MuscleGroup,
} from '../data/mockData'

function computeStreak(dates: string[]) {
  if (dates.length === 0) return 0
  const uniqueDays = [...new Set(dates.map((d) => d.slice(0, 10)))].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedKey = expected.toISOString().slice(0, 10)
    if (uniqueDays.includes(expectedKey)) streak++
    else break
  }
  return streak
}

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { sessions } = useWorkoutTracker()
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const workoutsRef = useRef<HTMLElement>(null)

  const [activeFilter, setActiveFilter] = useState<MuscleGroup | 'all'>('all')
  const [search, setSearch] = useState('')

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'
  const initial = firstName.charAt(0).toUpperCase()

  const stats = useMemo(() => {
    const completed = sessions.length
    const minutes = completed > 0
      ? sessions.reduce((sum, s) => sum + Math.max(s.exercises.length * 8, 15), 0)
      : 48
    const calories = completed > 0 ? Math.round(minutes * 10.8) : 520
    const streak = computeStreak(sessions.map((s) => s.date)) || 7

    return {
      calories,
      completed: completed || 1,
      minutes,
      streak,
    }
  }, [sessions])

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

  useEffect(() => {
    if (location.hash === '#workouts') {
      workoutsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div className="min-h-full bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />

        <div className="relative px-6 pb-6 pt-8 lg:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={20} className="text-orange-500" />
              <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black"
            >
              {initial}
            </button>
          </div>

          <div className="mt-8">
            <p className="text-neutral-300">Hello, {firstName} 👋</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight lg:text-4xl">
              Let&apos;s crush your <span className="text-orange-500">workout</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-400">Discipline today, strength tomorrow.</p>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3.5 ring-1 ring-neutral-800">
            <Search size={18} className="shrink-0 text-neutral-500" />
            <input
              type="search"
              placeholder="Search exercises, muscle groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
            />
            <SlidersHorizontal size={18} className="shrink-0 text-neutral-500" />
          </div>
        </div>
      </section>

      <div className="space-y-8 px-6 py-6 lg:px-10">
        {/* Stats */}
        <section className="grid grid-cols-4 gap-3">
          {[
            { icon: Flame, value: stats.calories, label: 'Calories', color: 'text-orange-500' },
            { icon: Dumbbell, value: stats.completed, label: 'Workouts', color: 'text-emerald-400' },
            { icon: Clock, value: stats.minutes, label: 'Minutes', color: 'text-sky-400' },
            { icon: TrendingUp, value: stats.streak, label: 'Streak', color: 'text-orange-500' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="rounded-2xl bg-neutral-900 px-2 py-3 text-center ring-1 ring-neutral-800"
            >
              <Icon size={16} className={`mx-auto ${color}`} />
              <p className="mt-1.5 text-lg font-bold">{value}</p>
              <p className="text-[9px] text-neutral-500">{label}</p>
            </div>
          ))}
        </section>

        {/* Popular workouts */}
        <section id="workouts" ref={workoutsRef}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Popular Workouts</h2>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="text-sm font-semibold text-orange-500"
            >
              See all
            </button>
          </div>

          <div className="scrollbar-hide -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {homeFilters.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={[
                    'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-neutral-900 text-neutral-300 ring-1 ring-neutral-800',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {filteredWorkouts.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  id={workout.id}
                  title={workout.shortTitle ?? workout.title}
                  duration={workout.duration}
                  calories={workout.calories}
                  intensity={workout.intensity}
                  difficulty={workout.difficulty}
                  image={workout.image}
                  bookmarked={isBookmarked(workout.id)}
                  onBookmarkToggle={() => toggleBookmark(workout.id)}
                  onClick={() => navigate(`/workout/${workout.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-neutral-900 px-6 py-12 text-center ring-1 ring-neutral-800">
              <p className="font-semibold">No workouts found</p>
              <p className="mt-1 text-sm text-neutral-500">Try another filter or search term</p>
            </div>
          )}
        </section>

        {/* Motivation banner */}
        <section className="relative overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-neutral-800">
          <img
            src={motivationImage}
            alt=""
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-transparent" />
          <div className="relative flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/20">
              <Trophy size={22} className="text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-orange-500">Stay Consistent</p>
              <p className="mt-0.5 text-sm text-neutral-300">
                Your future self is cheering for you.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
