import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search, Sparkles, Star } from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import { useAuth } from '../context/AuthContext'
import { categories, heroImage, workouts, type MuscleGroup } from '../data/mockData'

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

  const trending = useMemo(
    () => [...workouts].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [],
  )

  const activeLabel = categories.find((c) => c.id === activeMuscle)?.label ?? 'Workout'
  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'

  return (
    <div className="min-h-full bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        <div className="relative px-5 pb-10 pt-8 lg:px-10 lg:pt-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-widest text-white/80">ONEMOREREP</span>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black"
            >
              {firstName.charAt(0).toUpperCase()}
            </button>
          </div>

          <div className="mt-10">
            <p className="text-white/70">Hello, {firstName} 👋</p>
            <h1 className="mt-1 max-w-xs text-3xl font-bold leading-tight text-white lg:text-4xl">
              Let&apos;s crush your workout
            </h1>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3.5 shadow-xl backdrop-blur dark:bg-neutral-900/95">
            <Search size={20} className="shrink-0 text-neutral-400" />
            <input
              type="search"
              placeholder="Search workouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-neutral-400 dark:text-white"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 lg:px-10">
        {/* Muscle filter */}
        <section>
          <h2 className="text-lg font-bold dark:text-white">Target muscle</h2>
          <div className="scrollbar-hide -mx-5 mt-4 flex gap-4 overflow-x-auto px-5 lg:mx-0 lg:px-0">
            {categories.map((cat) => {
              const isActive = activeMuscle === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveMuscle(cat.id)}
                  className="flex shrink-0 flex-col items-center gap-2"
                >
                  <div
                    className={[
                      'flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl text-2xl transition-all duration-200',
                      isActive
                        ? 'scale-105 bg-black text-white shadow-lg dark:bg-white dark:text-black'
                        : 'bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white',
                    ].join(' ')}
                  >
                    {cat.icon}
                  </div>
                  <span
                    className={[
                      'text-xs font-semibold',
                      isActive ? 'text-black dark:text-white' : 'text-neutral-400',
                    ].join(' ')}
                  >
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Trending scroll */}
        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="text-lg font-bold dark:text-white">Trending</h2>
            </div>
          </div>
          <div className="scrollbar-hide -mx-5 mt-4 flex gap-4 overflow-x-auto px-5 lg:mx-0 lg:px-0">
            {trending.map((workout) => (
              <button
                key={workout.id}
                type="button"
                onClick={() => navigate(`/workout/${workout.id}`)}
                className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl"
              >
                <img src={workout.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="truncate text-sm font-bold text-white">{workout.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
                    <Star size={11} className="fill-white text-white" />
                    {workout.rating}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Workout grid */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-white">{activeLabel} workouts</h2>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {filteredWorkouts.length} plans
            </span>
          </div>

          {filteredWorkouts.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  title={workout.title}
                  stat={workout.stat}
                  rating={workout.rating}
                  duration={workout.duration}
                  image={workout.image}
                  onClick={() => navigate(`/workout/${workout.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl bg-neutral-100 px-6 py-14 text-center dark:bg-neutral-900">
              <p className="text-4xl">🏋️</p>
              <p className="mt-3 font-semibold dark:text-white">No workouts found</p>
              <p className="mt-1 text-sm text-neutral-500">Try another muscle or search term</p>
            </div>
          )}
        </section>

        {/* Tracker CTA */}
        <button
          type="button"
          onClick={() => navigate('/tracker')}
          className="flex w-full items-center justify-between rounded-3xl bg-black px-6 py-5 text-left text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <div>
            <p className="font-bold">Start tracking</p>
            <p className="mt-0.5 text-sm text-white/60 dark:text-neutral-500">
              Log sets, reps & weight
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black dark:bg-black dark:text-white">
            <ChevronRight size={22} />
          </div>
        </button>
      </div>
    </div>
  )
}
