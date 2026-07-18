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
  const muscleSummary = todayPlan.muscles
    .map((group) => exerciseGroupLabels[group])
    .join(' · ')

  return (
    <div
      data-tour="workout-ready"
      className="relative min-h-[220px] overflow-hidden rounded-3xl ring-1 ring-border"
    >
      <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/85" />

      <div className="relative flex min-h-[220px] flex-col gap-5 p-5 text-white lg:gap-6 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Ready to train
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight tracking-tight lg:text-2xl">
              {hasTodayPlan ? `${WEEKDAY_LABELS[today]} workout` : 'Start your session'}
            </h2>
            {hasTodayPlan ? (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/65">
                {muscleSummary}
                <span className="text-white/40"> · </span>
                {exerciseTotal} exercise{exerciseTotal === 1 ? '' : 's'}
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/65">No plan for today.</p>
            )}
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/15 backdrop-blur-sm">
            <Dumbbell size={18} className="text-white/90" />
          </div>
        </div>

        <div className="mt-auto space-y-2.5">
          {hasTodayPlan && (
            <button
              type="button"
              onClick={onStartToday}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-gradient-to-b from-black/35 to-black/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:from-black/45 hover:to-black/25"
            >
              <Play size={15} className="fill-current" />
              Start today&apos;s workout
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onStartEmpty}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/12 backdrop-blur-sm transition hover:bg-white/16"
            >
              Start empty
            </button>
            <button
              type="button"
              onClick={onEditPlan}
              className="flex items-center justify-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/12 backdrop-blur-sm transition hover:bg-white/16"
            >
              <Calendar size={13} />
              Edit plan
            </button>
          </div>

          {lastSession && onRepeatLast && (
            <button
              type="button"
              onClick={onRepeatLast}
              className="flex w-full items-center gap-2.5 rounded-xl bg-white/8 px-3 py-2 text-left ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/14"
            >
              <Copy size={14} className="shrink-0 text-white/60" />
              <p className="min-w-0 flex-1 truncate text-xs">
                <span className="text-white/55">Repeat</span>
                <span className="font-medium text-white"> {lastSession.name}</span>
                <span className="text-white/50">
                  {' '}
                  · {formatSessionDate(lastSession.date)}
                </span>
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
