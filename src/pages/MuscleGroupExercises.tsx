import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import {
  getExerciseGroupById,
  getExercisesByGroup,
  isExerciseGroup,
} from '../data/exerciseGuides'
import { saveScrollPosition } from '../lib/scrollRestore'

export default function MuscleGroupExercises() {
  const { group: groupId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/home')
  }

  function openExercise(exerciseId: string) {
    saveScrollPosition(location.pathname, location.search, location.hash)
    navigate(`/exercises/${exerciseId}`)
  }

  if (!groupId || !isExerciseGroup(groupId)) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-background px-5 text-foreground">
        <p className="font-semibold">Muscle group not found</p>
        <button
          type="button"
          onClick={goBack}
          className="mt-4 text-sm text-foreground underline-offset-2 hover:underline"
        >
          Back to home
        </button>
      </div>
    )
  }

  const group = getExerciseGroupById(groupId)!
  const exercises = getExercisesByGroup(groupId)

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="lg:desktop-page lg:mx-auto lg:grid lg:grid-cols-[minmax(320px,42%)_minmax(0,1fr)] lg:gap-0">
      <div className="relative h-56 overflow-hidden lg:sticky lg:top-0 lg:h-dvh">
        <img src={group.image} alt="" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-36 bg-gradient-to-t from-background via-background/85 to-transparent dark:block" />

        <button
          type="button"
          onClick={goBack}
          className="absolute left-5 top-[max(1.5rem,env(safe-area-inset-top))] z-10 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-black/10 backdrop-blur transition hover:bg-white dark:bg-background/85 dark:shadow-none dark:ring-border"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="absolute bottom-5 left-5 right-5 z-10 dark:bottom-8">
          <h1 className="text-2xl font-bold text-white lg:text-3xl">{group.label}</h1>
          <p className="mt-1 text-sm text-white/75">
            {group.count} exercise{group.count === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <section className="relative px-5 pb-6 pt-6 lg:px-10 lg:pb-10 lg:pt-10 dark:pt-2 lg:dark:pt-10">
        <p className="mb-4 text-sm font-medium text-muted">Choose an exercise</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                onClick={() => openExercise(exercise.id)}
                className="group flex w-full items-center gap-4 rounded-2xl bg-surface p-3.5 text-left shadow-sm ring-1 ring-border transition hover:bg-surface-elevated hover:ring-foreground/15 dark:shadow-none"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-elevated ring-1 ring-border/80">
                  <img
                    src={exercise.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{exercise.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{exercise.equipment}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-muted transition group-hover:text-foreground"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </div>
  )
}
