import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Search } from 'lucide-react'
import WorkoutCard from '../components/WorkoutCard'
import { categories, workouts, type MuscleGroup } from '../data/mockData'

export default function Home() {
  const navigate = useNavigate()
  const [activeMuscle, setActiveMuscle] = useState<MuscleGroup>('chest')
  const [showAll, setShowAll] = useState(false)

  const filteredWorkouts = useMemo(
    () => (showAll ? workouts : workouts.filter((w) => w.muscle === activeMuscle)),
    [activeMuscle, showAll],
  )

  const activeLabel = categories.find((c) => c.id === activeMuscle)?.label ?? 'Workout'

  function handleMuscleClick(muscle: MuscleGroup) {
    setActiveMuscle(muscle)
    setShowAll(false)
  }

  return (
    <div className="px-5 pt-8 lg:px-10 lg:pt-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Hello,</p>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Shahinur</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white transition hover:bg-neutral-50"
          >
            <Search size={20} />
          </button>
          <button
            type="button"
            aria-label="Calendar"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white transition hover:bg-neutral-50"
          >
            <Calendar size={20} />
          </button>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-neutral-500">Target Muscle</h2>
        <div className="scrollbar-hide -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {categories.map((cat) => {
            const isActive = !showAll && activeMuscle === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleMuscleClick(cat.id)}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <div
                  className={[
                    'flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition-colors',
                    isActive ? 'bg-black text-white' : 'bg-surface text-black',
                  ].join(' ')}
                >
                  {cat.icon}
                </div>
                <span
                  className={[
                    'text-xs font-medium',
                    isActive ? 'text-black' : 'text-neutral-500',
                  ].join(' ')}
                >
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {showAll ? 'All Workouts' : `${activeLabel} Workouts`}
          </h2>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm font-medium text-neutral-500 hover:text-black"
          >
            {showAll ? 'Show filtered' : 'See all'}
          </button>
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
          <div className="rounded-2xl bg-surface px-6 py-10 text-center text-neutral-500">
            <p className="font-medium text-black">No workouts yet</p>
            <p className="mt-1 text-sm">Check back soon for {activeLabel.toLowerCase()} routines.</p>
          </div>
        )}
      </section>
    </div>
  )
}
