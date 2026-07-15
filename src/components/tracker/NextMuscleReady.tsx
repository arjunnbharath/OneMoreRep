import { Check } from 'lucide-react'
import Button from '../Button'
import { exerciseGroupLabels, type ExerciseGroup } from '../../data/exerciseGuides'
import { exercisesForMuscle, groupLabel, WEEKDAY_LABELS } from '../../lib/workoutPlan'
import type { Weekday, WeeklyPlan } from '../../types/workoutPlan'
import type { WorkoutSession } from '../../types/tracker'

interface NextMuscleReadyProps {
  day: Weekday
  muscle: ExerciseGroup
  plan: WeeklyPlan
  lastSession: WorkoutSession
  onContinue: () => void
  onDone: () => void
}

export default function NextMuscleReady({
  day,
  muscle,
  plan,
  lastSession,
  onContinue,
  onDone,
}: NextMuscleReadyProps) {
  const exercises = exercisesForMuscle(plan[day], muscle)
  const finishedLabel = lastSession.name.split('·').pop()?.trim() ?? 'Muscle group'

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 py-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
        <Check size={28} strokeWidth={2.5} />
      </div>

      <div>
        <p className="text-sm text-muted">{finishedLabel} complete</p>
        <h2 className="mt-2 text-2xl font-bold">Ready for next muscle</h2>
        <p className="mt-2 text-sm text-muted">
          {WEEKDAY_LABELS[day]} · up next
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
        <p className="text-xl font-bold">{groupLabel(muscle)}</p>
        <p className="mt-1 text-sm text-muted">
          {exercises.length} exercise{exercises.length === 1 ? '' : 's'} planned
        </p>
        <ul className="mt-3 space-y-1 text-left text-sm text-muted">
          {exercises.map((e) => (
            <li key={e.id}>· {e.name}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Button fullWidth className="py-3.5" onClick={onContinue}>
          Start {exerciseGroupLabels[muscle]}
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="w-full py-2.5 text-sm text-muted hover:text-foreground"
        >
          I&apos;m done for today
        </button>
      </div>
    </div>
  )
}
