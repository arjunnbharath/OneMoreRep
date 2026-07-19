import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react'
import SwipeablePlanDayCard, { SWIPE_HINT_TOTAL_MS } from '../plan/SwipeablePlanDayCard'
import { useAppInstalled } from '../../hooks/useAppInstalled'
import {
  exerciseGroupLabels,
  exerciseGroups,
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
} from '../../lib/workoutPlan'
import { WEEKDAYS, type PlanExercise, type Weekday, type WeeklyPlan } from '../../types/workoutPlan'

const PLAN_SWIPE_HINT_STORAGE_KEY = 'onemorerep-plan-swipe-hint-count'
const PLAN_SWIPE_HINT_MAX_SHOWS = 2
const ADDED_COMPRESS_THRESHOLD = 4

function muscleGroupImage(group: ExerciseGroup) {
  return exerciseGroups.find((item) => item.id === group)?.image ?? ''
}

function getPlanSwipeHintCount() {
  const raw = localStorage.getItem(PLAN_SWIPE_HINT_STORAGE_KEY)
  const count = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(count) ? count : 0
}

function markPlanSwipeHintShown() {
  const next = getPlanSwipeHintCount() + 1
  localStorage.setItem(PLAN_SWIPE_HINT_STORAGE_KEY, String(next))
}

interface WeeklyPlanPanelProps {
  plan: WeeklyPlan
  planDay?: Weekday
  planMuscle?: ExerciseGroup
  onNavigateWeek: () => void
  onNavigateDay: (day: Weekday) => void
  onNavigateMuscle: (day: Weekday, group: ExerciseGroup) => void
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
  swipeHintKey?: number
}

function WeekGrid({
  plan,
  onSelectDay,
  onStartDay,
  playSwipeHint = false,
}: {
  plan: WeeklyPlan
  onSelectDay: (day: Weekday) => void
  onStartDay: (day: Weekday) => void
  playSwipeHint?: boolean
}) {
  const today = getTodayWeekday()

  return (
    <ul
      data-tour="plan-week-grid"
      className="space-y-3 overflow-x-hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3"
    >
      {WEEKDAYS.map((day) => {
        const dayPlan = plan[day]
        const muscles = dayPlan.muscles
        const isToday = day === today
        const hasPlan = muscles.length > 0
        const exerciseTotal = muscles.reduce(
          (sum, g) => sum + muscleExerciseCount(dayPlan, g),
          0,
        )
        const canStart = muscles.some((g) => muscleExerciseCount(dayPlan, g) > 0)

        return (
          <SwipeablePlanDayCard
            key={day}
            as="li"
            day={day}
            canStart={canStart}
            isToday={isToday}
            playHint={playSwipeHint && isToday}
            onSelect={() => onSelectDay(day)}
            onStart={() => onStartDay(day)}
          >
              <img
                src={imageForDayPlan(day, dayPlan)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/45 to-black/30" />

              <div className="relative flex min-h-[5.5rem] items-center gap-3 px-4 py-4 text-white">
                <div className="shrink-0">
                  <p className="text-base font-bold leading-tight">{WEEKDAY_LABELS[day]}</p>
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
          </SwipeablePlanDayCard>
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
  const appInstalled = useAppInstalled()
  const available = PLAN_GROUPS.filter((g) => !dayPlan.muscles.includes(g))
  const canStart = dayPlan.muscles.some((g) => muscleExerciseCount(dayPlan, g) > 0)
  const availableGroups = exerciseGroups.filter((g) => available.includes(g.id))

  return (
    <div className="space-y-4">
      {!appInstalled && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Week
        </button>
      )}

      <div className="flex items-center justify-between gap-3" data-tour="plan-day-header">
        <h2 className="plan-muscle-label text-lg font-bold uppercase leading-none tracking-[0.16em]">
          {WEEKDAY_LABELS[day]}
        </h2>
        <button
          type="button"
          onClick={onStartDay}
          disabled={!canStart}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start
        </button>
      </div>

      {dayPlan.muscles.length > 0 && (
        <ul className="space-y-2">
          {dayPlan.muscles.map((group) => {
            const count = muscleExerciseCount(dayPlan, group)
            return (
              <li key={group}>
                <div className="flex items-center gap-1 rounded-2xl bg-surface ring-1 ring-border transition hover:ring-foreground/20">
                  <button
                    type="button"
                    onClick={() => onSelectMuscle(group)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60">
                      <img
                        src={muscleGroupImage(group)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{exerciseGroupLabels[group]}</p>
                      <p className="text-xs text-muted">
                        {count === 0 ? 'Tap to add exercises' : `${count} exercise${count === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-muted" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveMuscle(group)}
                    aria-label={`Remove ${exerciseGroupLabels[group]}`}
                    className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {availableGroups.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {dayPlan.muscles.length === 0 ? 'Choose muscle groups' : 'Add muscle group'}
          </p>
          <div data-tour="plan-add-muscle" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {availableGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => onAddMuscle(group.id)}
                className="muscle-add-tile group/tile relative aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-border transition hover:ring-foreground/25"
              >
                <img
                  src={group.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover/tile:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-white ring-1 ring-white/20 backdrop-blur-sm dark:bg-white/10 dark:ring-white/15">
                  <Plus size={12} strokeWidth={2.5} />
                </span>
                <p className="absolute inset-x-0 bottom-0 px-1.5 pb-2 text-center text-[10px] font-semibold leading-tight text-white">
                  {group.label}
                </p>
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
  const navigate = useNavigate()
  const appInstalled = useAppInstalled()
  const [addedExpanded, setAddedExpanded] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (exercises.length < ADDED_COMPRESS_THRESHOLD) {
      setAddedExpanded(false)
    }
  }, [exercises.length])

  const library = useMemo(() => exerciseGuides.filter((e) => e.group === group), [group])
  const plannedNames = useMemo(
    () => new Set(exercises.map((e) => e.name.toLowerCase())),
    [exercises],
  )
  const availableLibrary = useMemo(
    () => library.filter((e) => !plannedNames.has(e.name.toLowerCase())),
    [library, plannedNames],
  )
  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return availableLibrary
    const q = search.toLowerCase()
    return availableLibrary.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(q) ||
        exercise.equipment.toLowerCase().includes(q),
    )
  }, [availableLibrary, search])

  function addFromLibrary(name: string) {
    onAddExercise(day, group, name, 3, 12)
  }

  const shouldCompressAdded =
    exercises.length >= ADDED_COMPRESS_THRESHOLD && !addedExpanded

  const addedSummary = exercises
    .slice(0, 2)
    .map((exercise) => exercise.name)
    .join(', ')

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 pb-1" data-tour="plan-muscle-header">
        <div className="flex w-full items-center py-0.5">
          {appInstalled ? (
            <span className="min-w-0 text-sm leading-snug text-muted">{WEEKDAY_LABELS[day]}</span>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="flex min-w-0 items-center gap-1.5 text-sm leading-snug text-muted transition hover:text-foreground"
            >
              <ArrowLeft size={15} className="shrink-0" strokeWidth={2} />
              <span>{WEEKDAY_LABELS[day]}</span>
            </button>
          )}
          <span className="plan-muscle-label ml-auto shrink-0 pl-4 text-[11px] font-medium uppercase leading-none tracking-[0.14em]">
            {groupLabel(group)}
          </span>
        </div>
      </div>

      {exercises.length > 0 && (
        <div className="shrink-0">
          {shouldCompressAdded ? (
            <button
              type="button"
              onClick={() => setAddedExpanded(true)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left shadow-[var(--shadow-card)] ring-1 ring-border transition hover:bg-surface-elevated"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">Your workout</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {exercises.length} exercises · {addedSummary}
                  {exercises.length > 2 ? ` +${exercises.length - 2} more` : ''}
                </p>
              </div>
              <ChevronDown size={16} className="shrink-0 text-muted" strokeWidth={2} />
            </button>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)] ring-1 ring-border">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
                <p className="text-sm font-semibold">Your workout</p>
                {exercises.length >= ADDED_COMPRESS_THRESHOLD && (
                  <button
                    type="button"
                    onClick={() => setAddedExpanded(false)}
                    className="flex h-6 shrink-0 items-center gap-0.5 rounded-full bg-foreground/5 px-2.5 text-[10px] font-medium text-muted ring-1 ring-border/60 backdrop-blur-sm transition hover:bg-foreground/10 hover:text-foreground dark:bg-white/5 dark:ring-white/10"
                  >
                    Collapse
                    <ChevronDown size={10} className="rotate-180" strokeWidth={2} />
                  </button>
                )}
              </div>
              <ul className="scrollbar-hide max-h-[min(36vh,14rem)] divide-y divide-border/70 overflow-y-auto overscroll-contain">
                {exercises.map((exercise, index) => (
                  <li
                    key={exercise.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[11px] font-semibold text-muted ring-1 ring-border/60 dark:bg-white/5">
                      {index + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{exercise.name}</p>
                    <button
                      type="button"
                      onClick={() => onRemoveExercise(day, group, exercise.id)}
                      aria-label={`Remove ${exercise.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col" data-tour="plan-add-exercises">
        {availableLibrary.length > 0 ? (
          <>
            <div className="shrink-0 space-y-2.5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  Add exercises
                </p>
                <span className="text-[11px] text-muted">{filteredAvailable.length} left</span>
              </div>
              {availableLibrary.length > 3 && (
                <div className="relative">
                  <Search
                    size={12}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/70"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-lg bg-foreground/5 py-2 pl-8 pr-3 text-xs outline-none ring-1 ring-border/40 placeholder:text-muted/70 focus:bg-surface focus:ring-border/70 dark:bg-white/5"
                  />
                </div>
              )}
            </div>
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-px pb-[calc(var(--mobile-nav-height)+0.75rem)] lg:pb-6">
              {filteredAvailable.length > 0 ? (
                <ul className="space-y-2">
                  {filteredAvailable.map((exercise, index) => (
                    <li
                      key={exercise.id}
                      className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-surface p-2.5 ring-1 ring-border"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60">
                        <img
                          src={exercise.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-snug">{exercise.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted">{exercise.equipment}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/exercises/${exercise.id}`, {
                              state: { fromPlan: true, planDay: day, planMuscle: group },
                            })
                          }
                          className="flex h-7 items-center gap-0.5 rounded-full bg-foreground/5 px-2.5 text-[10px] font-medium text-muted ring-1 ring-border/60 backdrop-blur-sm transition hover:bg-foreground/10 hover:text-foreground dark:bg-white/5 dark:ring-white/10"
                        >
                          Explore
                          <ChevronRight size={10} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => addFromLibrary(exercise.name)}
                          aria-label={`Add ${exercise.name}`}
                          data-tour={index === 0 ? 'plan-add-exercise-btn' : undefined}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-green-600 ring-1 ring-green-500/30 backdrop-blur-sm transition hover:bg-green-500/30 dark:bg-green-500/15 dark:text-green-400 dark:ring-green-400/25"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border">
                  <p className="text-sm font-medium">No matches</p>
                  <p className="mt-1 text-xs text-muted">Try a different search term.</p>
                </div>
              )}
            </div>
          </>
        ) : exercises.length > 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface px-6 py-10 text-center ring-1 ring-border">
            <div>
              <p className="text-sm font-semibold">All set</p>
              <p className="mt-1 text-xs text-muted">Every {groupLabel(group).toLowerCase()} exercise is in your plan.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default function WeeklyPlanPanel({
  plan,
  planDay,
  planMuscle,
  onNavigateWeek,
  onNavigateDay,
  onNavigateMuscle,
  onAddMuscle,
  onRemoveMuscle,
  onAddExercise,
  onRemoveExercise,
  onStartDay,
  swipeHintKey = 0,
}: WeeklyPlanPanelProps) {
  const [playSwipeHint, setPlaySwipeHint] = useState(false)

  useEffect(() => {
    if (planDay || planMuscle || !swipeHintKey) return
    if (window.matchMedia('(min-width: 1024px)').matches) return
    if (getPlanSwipeHintCount() >= PLAN_SWIPE_HINT_MAX_SHOWS) return

    markPlanSwipeHintShown()
    setPlaySwipeHint(false)
    const frame = window.requestAnimationFrame(() => setPlaySwipeHint(true))
    const reset = window.setTimeout(() => setPlaySwipeHint(false), SWIPE_HINT_TOTAL_MS + 200)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(reset)
    }
  }, [planDay, planMuscle, swipeHintKey])

  if (planDay && planMuscle) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <MuscleScreen
          day={planDay}
          group={planMuscle}
          exercises={exercisesForMuscle(plan[planDay], planMuscle)}
          onBack={() => onNavigateDay(planDay)}
          onAddExercise={onAddExercise}
          onRemoveExercise={onRemoveExercise}
        />
      </div>
    )
  }

  if (planDay) {
    return (
      <DayScreen
        day={planDay}
        dayPlan={plan[planDay]}
        onBack={onNavigateWeek}
        onSelectMuscle={(group) => onNavigateMuscle(planDay, group)}
        onAddMuscle={(group) => onAddMuscle(planDay, group)}
        onRemoveMuscle={(group) => onRemoveMuscle(planDay, group)}
        onStartDay={() => onStartDay(planDay)}
      />
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Weekly plan
      </h2>
      <WeekGrid
        plan={plan}
        onSelectDay={onNavigateDay}
        onStartDay={onStartDay}
        playSwipeHint={playSwipeHint}
      />
    </div>
  )
}
