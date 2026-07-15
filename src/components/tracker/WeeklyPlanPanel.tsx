import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react'
import Button from '../Button'
import {
  exerciseGroupLabels,
  exerciseGuides,
  type ExerciseGroup,
} from '../../data/exerciseGuides'
import {
  exercisesForMuscle,
  getTodayWeekday,
  groupLabel,
  imageForDayPlan,
  muscleExerciseCount,
  PLAN_GROUPS,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
} from '../../lib/workoutPlan'
import { WEEKDAYS, type PlanExercise, type Weekday, type WeeklyPlan } from '../../types/workoutPlan'

type Screen =
  | { step: 'week' }
  | { step: 'day'; day: Weekday }
  | { step: 'muscle'; day: Weekday; group: ExerciseGroup }

interface WeeklyPlanPanelProps {
  plan: WeeklyPlan
  onAddMuscle: (day: Weekday, group: ExerciseGroup) => void
  onRemoveMuscle: (day: Weekday, group: ExerciseGroup) => void
  onAddExercise: (
    day: Weekday,
    group: ExerciseGroup,
    name: string,
    sets: number,
    reps: number,
    weight?: number,
  ) => void
  onRemoveExercise: (day: Weekday, group: ExerciseGroup, exerciseId: string) => void
  onStartDay: (day: Weekday) => void
}

function WeekGrid({
  plan,
  onSelectDay,
}: {
  plan: WeeklyPlan
  onSelectDay: (day: Weekday) => void
}) {
  const today = getTodayWeekday()

  return (
    <ul className="space-y-3">
      {WEEKDAYS.map((day) => {
        const dayPlan = plan[day]
        const muscles = dayPlan.muscles
        const isToday = day === today
        const hasPlan = muscles.length > 0
        const exerciseTotal = muscles.reduce(
          (sum, g) => sum + muscleExerciseCount(dayPlan, g),
          0,
        )

        return (
          <li key={day}>
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className={[
                'group relative w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.99]',
                isToday ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : '',
              ].join(' ')}
            >
              <img
                src={imageForDayPlan(day, dayPlan)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/55" />

              <div className="relative flex min-h-[5.5rem] items-center gap-3 px-4 py-4 text-white">
                <div className="w-11 shrink-0">
                  <p className="text-lg font-bold leading-none">{WEEKDAY_SHORT[day]}</p>
                  <p className="mt-1 text-[10px] font-medium text-white/60">
                    {WEEKDAY_LABELS[day]}
                  </p>
                  {isToday && (
                    <span className="mt-1.5 inline-block rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
                      Today
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {!hasPlan ? (
                    <p className="text-sm text-white/70">Rest day · tap to plan</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {muscles.map((group) => (
                          <span
                            key={group}
                            className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
                          >
                            {exerciseGroupLabels[group]}
                          </span>
                        ))}
                      </div>
                      {exerciseTotal > 0 && (
                        <p className="mt-1.5 text-xs text-white/60">
                          {exerciseTotal} exercise{exerciseTotal === 1 ? '' : 's'}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ChevronRight size={18} className="shrink-0 text-white/50" />
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function DayScreen({
  day,
  dayPlan,
  onBack,
  onSelectMuscle,
  onAddMuscle,
  onRemoveMuscle,
  onStartDay,
}: {
  day: Weekday
  dayPlan: WeeklyPlan[Weekday]
  onBack: () => void
  onSelectMuscle: (group: ExerciseGroup) => void
  onAddMuscle: (group: ExerciseGroup) => void
  onRemoveMuscle: (group: ExerciseGroup) => void
  onStartDay: () => void
}) {
  const available = PLAN_GROUPS.filter((g) => !dayPlan.muscles.includes(g))
  const canStart = dayPlan.muscles.some((g) => muscleExerciseCount(dayPlan, g) > 0)

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Week
      </button>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{WEEKDAY_LABELS[day]}</h2>
        <Button className="px-4 py-2.5" onClick={onStartDay} disabled={!canStart}>
          Start
        </Button>
      </div>

      {dayPlan.muscles.length === 0 ? (
        <p className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border">
          Add a muscle group below to build this day.
        </p>
      ) : (
        <ul className="space-y-2">
          {dayPlan.muscles.map((group) => {
            const count = muscleExerciseCount(dayPlan, group)
            return (
              <li key={group}>
                <button
                  type="button"
                  onClick={() => onSelectMuscle(group)}
                  className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3.5 text-left ring-1 ring-border transition hover:ring-foreground/20"
                >
                  <div>
                    <p className="font-medium">{exerciseGroupLabels[group]}</p>
                    <p className="text-xs text-muted">
                      {count === 0 ? 'Tap to add exercises' : `${count} exercise${count === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <span className="text-muted">›</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveMuscle(group)}
                  className="mt-1 text-xs text-muted hover:text-red-500"
                >
                  Remove {exerciseGroupLabels[group]}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {available.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Add muscle group</p>
          <div className="flex flex-wrap gap-2">
            {available.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => onAddMuscle(group)}
                className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium ring-1 ring-border hover:bg-foreground hover:text-background"
              >
                + {exerciseGroupLabels[group]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MuscleScreen({
  day,
  group,
  exercises,
  onBack,
  onAddExercise,
  onRemoveExercise,
}: {
  day: Weekday
  group: ExerciseGroup
  exercises: PlanExercise[]
  onBack: () => void
  onAddExercise: WeeklyPlanPanelProps['onAddExercise']
  onRemoveExercise: WeeklyPlanPanelProps['onRemoveExercise']
}) {
  const [sets, setSets] = useState('4')
  const [reps, setReps] = useState('10')
  const [customName, setCustomName] = useState('')

  const library = useMemo(() => exerciseGuides.filter((e) => e.group === group), [group])
  const plannedNames = useMemo(
    () => new Set(exercises.map((e) => e.name.toLowerCase())),
    [exercises],
  )

  function addFromLibrary(name: string) {
    onAddExercise(day, group, name, parseInt(sets, 10) || 4, parseInt(reps, 10) || 10)
  }

  function handleCustomAdd(e: FormEvent) {
    e.preventDefault()
    if (!customName.trim()) return
    onAddExercise(day, group, customName, parseInt(sets, 10) || 4, parseInt(reps, 10) || 10)
    setCustomName('')
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {WEEKDAY_LABELS[day]}
      </button>

      <h2 className="text-xl font-bold">{groupLabel(group)}</h2>

      {exercises.length > 0 && (
        <ul className="divide-y divide-border rounded-2xl bg-surface ring-1 ring-border">
          {exercises.map((exercise, index) => (
            <li key={exercise.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-4 text-sm text-muted">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{exercise.name}</p>
                <p className="text-xs text-muted">
                  {exercise.sets} × {exercise.reps}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExercise(day, group, exercise.id)}
                className="text-xs text-muted hover:text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Pick exercises</p>
          <div className="flex gap-2 text-xs text-muted">
            <label className="flex items-center gap-1">
              Sets
              <input
                type="number"
                min={1}
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="no-spinner w-10 rounded-md bg-surface px-1 py-1 text-center outline-none ring-1 ring-border"
              />
            </label>
            <label className="flex items-center gap-1">
              Reps
              <input
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="no-spinner w-10 rounded-md bg-surface px-1 py-1 text-center outline-none ring-1 ring-border"
              />
            </label>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {library.map((exercise) => {
            const added = plannedNames.has(exercise.name.toLowerCase())
            return (
              <button
                key={exercise.id}
                type="button"
                disabled={added}
                onClick={() => addFromLibrary(exercise.name)}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-medium transition',
                  added
                    ? 'bg-foreground/10 text-muted line-through'
                    : 'bg-surface ring-1 ring-border hover:bg-foreground hover:text-background',
                ].join(' ')}
              >
                {exercise.name}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleCustomAdd} className="flex gap-2">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Custom exercise"
          className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-sm outline-none ring-1 ring-border"
        />
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background"
          aria-label="Add exercise"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  )
}

export default function WeeklyPlanPanel({
  plan,
  onAddMuscle,
  onRemoveMuscle,
  onAddExercise,
  onRemoveExercise,
  onStartDay,
}: WeeklyPlanPanelProps) {
  const [screen, setScreen] = useState<Screen>({ step: 'week' })

  if (screen.step === 'muscle') {
    return (
      <MuscleScreen
        day={screen.day}
        group={screen.group}
        exercises={exercisesForMuscle(plan[screen.day], screen.group)}
        onBack={() => setScreen({ step: 'day', day: screen.day })}
        onAddExercise={onAddExercise}
        onRemoveExercise={onRemoveExercise}
      />
    )
  }

  if (screen.step === 'day') {
    return (
      <DayScreen
        day={screen.day}
        dayPlan={plan[screen.day]}
        onBack={() => setScreen({ step: 'week' })}
        onSelectMuscle={(group) => setScreen({ step: 'muscle', day: screen.day, group })}
        onAddMuscle={(group) => onAddMuscle(screen.day, group)}
        onRemoveMuscle={(group) => onRemoveMuscle(screen.day, group)}
        onStartDay={() => onStartDay(screen.day)}
      />
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Weekly plan</h2>
      <WeekGrid plan={plan} onSelectDay={(day) => setScreen({ step: 'day', day })} />
    </div>
  )
}
