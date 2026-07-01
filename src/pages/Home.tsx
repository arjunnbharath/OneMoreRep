import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import { useAuth } from '../context/AuthContext'
import { heroImage, workouts } from '../data/mockData'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const filteredWorkouts = useMemo(() => {
    if (!search.trim()) return workouts
    const q = search.toLowerCase()
    return workouts.filter((w) => w.title.toLowerCase().includes(q))
  }, [search])

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
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-white">Workouts</h2>
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
              <p className="mt-1 text-sm text-neutral-500">Try a different search term</p>
            </div>
          )}
        </section>

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
