import { Calendar, Copy, Dumbbell, Play } from 'lucide-react'
import { exerciseGroupLabels } from '../../data/exerciseGuides'
import {
  exercisesForMuscle,
  getTodayWeekday,
  imageForDayPlan,
  muscleExerciseCount,
  WEEKDAY_LABELS,
} from '../../lib/workoutPlan'
import type { WorkoutSession } from '../../types/tracker'
import type { WeeklyPlan } from '../../types/workoutPlan'

const FALLBACK_BG = '/images/gym_background/gym-pic.jpg'

interface ReadyToTrainPanelProps {
  plan: WeeklyPlan
  lastSession?: WorkoutSession | null
  onStartToday: () => void
  onStartEmpty: () => void
  onEditPlan: () => void
  onRepeatLast?: () => void
  formatSessionDate: (iso: string) => string
}

export default function ReadyToTrainPanel({
  plan,
  lastSession,
  onStartToday,
  onStartEmpty,
  onEditPlan,
  onRepeatLast,
  formatSessionDate,
}: ReadyToTrainPanelProps) {
  const today = getTodayWeekday()
  const todayPlan = plan[today]
  const hasTodayPlan = todayPlan.muscles.some(
    (group) => exercisesForMuscle(todayPlan, group).length > 0,
  )
  const exerciseTotal = todayPlan.muscles.reduce(
    (sum, group) => sum + muscleExerciseCount(todayPlan, group),
    0,
  )
  const background = hasTodayPlan ? imageForDayPlan(today, todayPlan) : FALLBACK_BG

  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-border">
      <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/85" />

      <div className="relative p-5 text-white lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Ready to train
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight lg:text-[1.75rem]">
              {hasTodayPlan ? `${WEEKDAY_LABELS[today]} workout` : 'Start your session'}
            </h2>
            {hasTodayPlan ? (
              <>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {todayPlan.muscles.map((group) => (
                    <span
                      key={group}
                      className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
                    >
                      {exerciseGroupLabels[group]}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-white/70">
                  {exerciseTotal} exercise{exerciseTotal === 1 ? '' : 's'} planned for today
                </p>
              </>
            ) : (
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                No exercises planned for today. Start a blank session or build your weekly plan.
              </p>
            )}
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15 backdrop-blur-sm">
            <Dumbbell size={20} className="text-white/90" />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {hasTodayPlan && (
            <button
              type="button"
              onClick={onStartToday}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-foreground transition hover:bg-white/90"
            >
              <Play size={16} className="fill-current" />
              Start today&apos;s workout
            </button>
          )}

          <div className={hasTodayPlan ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 gap-2 sm:grid-cols-2'}>
            <button
              type="button"
              onClick={onStartEmpty}
              className="rounded-2xl bg-white/12 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/18"
            >
              Start empty workout
            </button>
            <button
              type="button"
              onClick={onEditPlan}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/12 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/18"
            >
              <Calendar size={15} />
              Edit plan
            </button>
          </div>
        </div>

        {lastSession && onRepeatLast && (
          <button
            type="button"
            onClick={onRepeatLast}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left ring-1 ring-white/12 backdrop-blur-sm transition hover:bg-white/15"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Repeat last workout
              </p>
              <p className="mt-1 truncate font-semibold text-white">{lastSession.name}</p>
              <p className="mt-0.5 text-xs text-white/65">
                {formatSessionDate(lastSession.date)} · {lastSession.exercises.length} exercises
              </p>
            </div>
            <Copy size={16} className="shrink-0 text-white/70" />
          </button>
        )}
      </div>
    </div>
  )
}
