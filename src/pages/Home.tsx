import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, Search } from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import { useAuth } from '../context/AuthContext'
import { categories, workouts, type MuscleGroup } from '../data/mockData'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeMuscle, setActiveMuscle] = useState<MuscleGroup>('chest')
  const [search, setSearch] = useState('')

  const filteredWorkouts = useMemo(() => {
    const byMuscle = workouts.filter((w) => w.muscle === activeMuscle)
    if (!search.trim()) return byMuscle
    const q = search.toLowerCase()
    return byMuscle.filter((w) => w.title.toLowerCase().includes(q))
  }, [activeMuscle, search])

  const featured = useMemo(
    () => [...workouts].sort((a, b) => b.rating - a.rating)[0],
    [],
  )

  const activeLabel = categories.find((c) => c.id === activeMuscle)?.label ?? 'Workout'
  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'
  const initial = firstName.charAt(0).toUpperCase()

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200/80 bg-white px-5 pb-6 pt-8 dark:border-neutral-800 dark:bg-neutral-950 lg:px-10 lg:pt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              OneMoreRep
            </p>
            <p className="mt-3 text-sm text-neutral-500">{getTodayLabel()}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-3xl">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900"
            >
              {initial}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <Search size={18} className="shrink-0 text-neutral-400" />
          <input
            type="search"
            placeholder="Search programs and workouts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
        {featured && (
          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Featured
                </p>
                <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                  Top rated program
                </h2>
              </div>
            </div>
            <WorkoutCard
              variant="featured"
              title={featured.title}
              stat={featured.stat}
              rating={featured.rating}
              duration={featured.duration}
              muscle={categories.find((c) => c.id === featured.muscle)?.label}
              image={featured.image}
              onClick={() => navigate(`/workout/${featured.id}`)}
            />
          </section>
        )}

        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Categories
          </p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
            Train by muscle group
          </h2>
          <div className="scrollbar-hide mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {categories.map((cat) => {
              const isActive = activeMuscle === cat.id
              const count = workouts.filter((w) => w.muscle === cat.id).length
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveMuscle(cat.id)}
                  className={[
                    'flex shrink-0 flex-col items-start rounded-xl border px-4 py-3 text-left transition',
                    isActive
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{cat.label}</span>
                  <span
                    className={[
                      'mt-0.5 text-xs',
                      isActive ? 'text-white/70 dark:text-neutral-500' : 'text-neutral-400',
                    ].join(' ')}
                  >
                    {count} programs
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Programs
              </p>
              <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                {activeLabel}
              </h2>
            </div>
            <span className="text-sm text-neutral-500">
              {filteredWorkouts.length} available
            </span>
          </div>

          {filteredWorkouts.length > 0 ? (
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  variant="compact"
                  title={workout.title}
                  stat={workout.stat}
                  rating={workout.rating}
                  duration={workout.duration}
                  muscle={activeLabel}
                  image={workout.image}
                  onClick={() => navigate(`/workout/${workout.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="font-medium text-neutral-900 dark:text-white">No programs found</p>
              <p className="mt-1 text-sm text-neutral-500">
                Try another muscle group or adjust your search.
              </p>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate('/tracker')}
          className="mt-10 flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-5 text-left transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Workout log
            </p>
            <p className="mt-1 font-semibold text-neutral-900 dark:text-white">
              Track today&apos;s session
            </p>
            <p className="mt-0.5 text-sm text-neutral-500">Record sets, reps, and weight</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <ArrowRight size={18} />
          </span>
        </button>
      </div>
    </div>
  )
}
