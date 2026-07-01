import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Flame, Search, Star, TrendingUp } from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import { useAuth } from '../context/AuthContext'
import { categories, workouts, type MuscleGroup } from '../data/mockData'

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
    () => [...workouts].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [],
  )

  const activeLabel = categories.find((c) => c.id === activeMuscle)?.label ?? 'Workout'
  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'

  return (
    <div className="min-h-full bg-surface lg:bg-white">
      <div className="bg-black px-5 pb-8 pt-8 text-white lg:rounded-none lg:px-10 lg:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/60">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">{firstName}</h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <Flame size={18} className="text-white/70" />
            <p className="mt-2 text-lg font-bold">{workouts.length}</p>
            <p className="text-xs text-white/60">Workouts</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <TrendingUp size={18} className="text-white/70" />
            <p className="mt-2 text-lg font-bold">{categories.length}</p>
            <p className="text-xs text-white/60">Muscles</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <Star size={18} className="text-white/70" />
            <p className="mt-2 text-lg font-bold">4.7</p>
            <p className="text-xs text-white/60">Avg rating</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-4 px-5 lg:px-10">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="shrink-0 text-neutral-400" />
          <input
            type="search"
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <section className="mt-6 px-5 lg:px-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Top picks
        </h2>
        <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
          {featured.map((workout) => (
            <button
              key={workout.id}
              type="button"
              onClick={() => navigate(`/workout/${workout.id}`)}
              className="relative h-36 w-56 shrink-0 overflow-hidden rounded-2xl text-left"
            >
              <img src={workout.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="truncate text-sm font-bold text-white">{workout.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
                  <Star size={12} className="fill-white text-white" />
                  {workout.rating} · {workout.duration}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5 lg:px-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Target muscle
        </h2>
        <div className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {categories.map((cat) => {
            const isActive = activeMuscle === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveMuscle(cat.id)}
                className={[
                  'flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-black text-white' : 'bg-white text-neutral-600 shadow-sm',
                ].join(' ')}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-8 px-5 pb-6 lg:px-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{activeLabel} workouts</h2>
          <span className="text-sm text-neutral-500">{filteredWorkouts.length} found</span>
        </div>

        {filteredWorkouts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                title={workout.title}
                stat={workout.stat}
                rating={workout.rating}
                image={workout.image}
                onClick={() => navigate(`/workout/${workout.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-10 text-center text-neutral-500 shadow-sm">
            <p className="font-medium text-black">No workouts found</p>
            <p className="mt-1 text-sm">Try a different muscle group or search term.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/tracker')}
          className="mt-6 flex w-full items-center justify-between rounded-2xl bg-black px-5 py-4 text-left text-white transition hover:bg-neutral-800"
        >
          <div>
            <p className="font-semibold">Log today&apos;s workout</p>
            <p className="mt-0.5 text-sm text-white/60">Track sets, reps & progress</p>
          </div>
          <ChevronRight size={20} className="text-white/60" />
        </button>
      </section>
    </div>
  )
}
