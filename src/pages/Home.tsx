import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Search,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import UserAvatar from '../components/UserAvatar'
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
import { exerciseGuides } from '../data/exerciseGuides'
import { findVideoForExercise } from '../data/workoutVideos'

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

  const stats = useMemo(() => {
    const completed = sessions.length
    const minutes = completed > 0
      ? sessions.reduce((sum, s) => sum + Math.max(s.exercises.length * 8, 15), 0)
      : 48
    const calories = completed > 0 ? Math.round(minutes * 10.8) : 520
    const streak = computeStreak(sessions.map((s) => s.date)) || 7

    return { calories, completed: completed || 1, minutes, streak }
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
    <div className="min-h-full bg-background text-foreground">
      <section className="relative min-h-[320px] overflow-hidden sm:min-h-[360px]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-75 dark:opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background dark:from-black/50 dark:via-black/35 dark:to-background" />

        <div className="relative px-6 pb-6 pt-8 lg:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={20} />
              <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Profile"
              className="transition hover:opacity-90"
            >
              <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="sm" />
            </button>
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted">Hello, {firstName} 👋</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight lg:text-4xl">
              Let&apos;s crush your workout
            </h1>
            <p className="mt-2 text-sm text-muted">Discipline today, strength tomorrow.</p>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface/80 px-4 py-3.5 ring-1 ring-border backdrop-blur">
            <Search size={18} className="shrink-0 text-muted" />
            <input
              type="search"
              placeholder="Search exercises, muscle groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
          </div>
        </div>
      </section>

      <div className="space-y-8 px-6 py-6 lg:px-10">
        <section className="grid grid-cols-4 gap-3">
          {[
            { icon: Flame, value: stats.calories, label: 'Calories' },
            { icon: Dumbbell, value: stats.completed, label: 'Workouts' },
            { icon: Clock, value: stats.minutes, label: 'Minutes' },
            { icon: TrendingUp, value: stats.streak, label: 'Streak' },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl bg-surface px-2 py-3 text-center ring-1 ring-border"
            >
              <Icon size={16} className="mx-auto text-foreground" />
              <p className="mt-1.5 text-lg font-bold">{value}</p>
              <p className="text-[9px] text-muted">{label}</p>
            </div>
          ))}
        </section>

        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="group flex w-full items-center justify-between rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition hover:ring-foreground/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <BookOpen size={22} className="text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold">Exercise Guides</p>
              <p className="text-xs text-muted">
                {exerciseGuides.length}+ exercises with demo videos
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground" />
        </button>

        <section id="workouts" ref={workoutsRef}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Popular Workouts</h2>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="text-sm font-semibold text-foreground underline-offset-2 hover:underline"
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
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-surface text-muted ring-1 ring-border hover:text-foreground',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {filteredWorkouts.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
              {filteredWorkouts.map((workout) => {
                const video = findVideoForExercise(
                  workout.exercises[0]?.name ?? workout.title,
                )
                return (
                  <WorkoutCard
                    key={workout.id}
                    id={workout.id}
                    title={workout.shortTitle ?? workout.title}
                    duration={workout.duration}
                    calories={workout.calories}
                    intensity={workout.intensity}
                    difficulty={workout.difficulty}
                    image={workout.image}
                    video={video?.available ? video.videoPath : undefined}
                    bookmarked={isBookmarked(workout.id)}
                    onBookmarkToggle={() => toggleBookmark(workout.id)}
                    onClick={() => navigate(`/workout/${workout.id}`)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-surface px-6 py-12 text-center ring-1 ring-border">
              <p className="font-semibold">No workouts found</p>
              <p className="mt-1 text-sm text-muted">Try another filter or search term</p>
            </div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <img
            src={motivationImage}
            alt=""
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-transparent" />
          <div className="relative flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
              <Trophy size={22} className="text-accent-foreground" />
            </div>
            <div>
              <p className="font-bold">Stay Consistent</p>
              <p className="mt-0.5 text-sm text-muted">
                Your future self is cheering for you.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
