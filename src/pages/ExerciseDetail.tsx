import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Lightbulb, ListOrdered } from 'lucide-react'
import Button from '../components/Button'
import { exerciseGroupLabels, getExerciseById, type ExerciseGroup } from '../data/exerciseGuides'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useAppInstalled } from '../hooks/useAppInstalled'
import { TRACKER_PATHS } from '../lib/trackerPaths'
import type { Weekday } from '../types/workoutPlan'

type PlanContext = {
  fromPlan?: boolean
  planDay?: Weekday
  planMuscle?: ExerciseGroup
}

export default function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { plan, addExercise } = useWorkoutPlan()
  const appInstalled = useAppInstalled()
  const exercise = getExerciseById(id ?? '')
  const planContext = (location.state ?? {}) as PlanContext
  const planDay = planContext.planDay
  const planMuscle = planContext.planMuscle
  const fromPlan = Boolean(planContext.fromPlan && planDay && planMuscle)

  if (!exercise) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-background px-5 text-foreground">
        <p className="font-semibold">Exercise not found</p>
        <button
          type="button"
          onClick={() => navigate(TRACKER_PATHS.exerciseLibrary)}
          className="mt-4 text-sm text-foreground underline-offset-2 hover:underline"
        >
          Back to guides
        </button>
      </div>
    )
  }

  const currentExercise = exercise

  const alreadyInPlan =
    fromPlan &&
    planDay &&
    planMuscle &&
    (plan[planDay].exercises[planMuscle] ?? []).some(
      (entry) => entry.name.toLowerCase() === currentExercise.name.toLowerCase(),
    )

  function handlePlanAction() {
    if (!fromPlan || !planDay || !planMuscle) return
    if (!alreadyInPlan) {
      addExercise(planDay, planMuscle, currentExercise.name, 3, 12)
    }
    navigate(TRACKER_PATHS.planMuscle(planDay, planMuscle))
  }

  return (
    <div className="min-h-full bg-background text-foreground lg:desktop-page lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(320px,44%)_minmax(0,1fr)]">
      <div className="relative h-64 lg:sticky lg:top-0 lg:h-dvh">
        <img src={currentExercise.image} alt="" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 lg:from-black/50 lg:via-black/10" />
        {!appInstalled && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-5 top-[max(1.5rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 text-foreground backdrop-blur transition hover:bg-background"
          >
            <ArrowLeft size={20} />
          </button>
        )}
      </div>

      <div className="px-5 pb-[calc(var(--mobile-nav-height)+2.5rem)] lg:desktop-page-body lg:px-10 lg:pb-10">
        <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold">
          {exerciseGroupLabels[currentExercise.group]}
        </span>
        <h1 className="mt-3 text-2xl font-bold lg:text-3xl">{currentExercise.name}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Dumbbell size={14} />
          {currentExercise.equipment}
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{currentExercise.description}</p>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ListOrdered size={18} />
            How to perform
          </h2>
          <ol className="mt-4 space-y-3">
            {currentExercise.steps.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Lightbulb size={18} />
            Tips
          </h2>
          <ul className="mt-4 grid gap-2 lg:grid-cols-2">
            {currentExercise.tips.map((tip) => (
              <li
                key={tip}
                className="rounded-xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-border"
              >
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {fromPlan ? (
          <Button
            fullWidth
            className="mt-8 max-w-sm py-3.5 lg:w-auto lg:px-8"
            onClick={handlePlanAction}
            disabled={alreadyInPlan}
          >
            {alreadyInPlan ? 'Added to plan' : 'Add to plan'}
          </Button>
        ) : (
          <Button fullWidth className="mt-8 max-w-sm py-3.5 lg:w-auto lg:px-8" onClick={() => navigate('/tracker')}>
            Log this exercise
          </Button>
        )}
      </div>
    </div>
  )
}
