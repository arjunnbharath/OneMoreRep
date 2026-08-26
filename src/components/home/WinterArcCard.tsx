import { ChevronRight, Snowflake } from 'lucide-react'
import { formatWinterArcEndDate } from '../../lib/winterArc'
import type { WinterArcProgress } from '../../types/winterArc'

interface WinterArcCardProps {
  progress: WinterArcProgress
  tasksCompleted: number
  tasksTotal: number
  onOpen: () => void
}

export default function WinterArcCard({
  progress,
  tasksCompleted,
  tasksTotal,
  onOpen,
}: WinterArcCardProps) {
  const {
    dayNumber,
    totalDays,
    daysRemaining,
    workoutsThisWeek,
    weeklyTarget,
    weeklyMet,
    streak,
    arcComplete,
    progressPercent,
    endDateKey,
    totalWorkouts,
  } = progress

  return (
    <button
      type="button"
      onClick={onOpen}
      data-tour="winter-arc"
      className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-left ring-1 ring-white/10 transition hover:ring-white/20"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Snowflake size={16} className="text-sky-200" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Winter Arc
                </p>
                <p className="text-base font-semibold tracking-tight text-white">
                  {arcComplete ? 'Arc complete' : `Day ${dayNumber} of ${totalDays}`}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/55">
              {arcComplete
                ? `${totalWorkouts} workouts logged during your arc`
                : `${daysRemaining} days left · ends ${formatWinterArcEndDate(endDateKey)}`}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {streak > 0 && (
              <div className="rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/10">
                <p className="text-lg font-bold tabular-nums leading-none text-white">{streak}</p>
                <p className="mt-0.5 text-[10px] text-white/50">streak</p>
              </div>
            )}
            <ChevronRight size={18} className="text-white/45" />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/55">
            <span>Arc progress</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-300 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
              {!arcComplete ? "Today's tasks" : 'This week'}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
              {!arcComplete ? (
                <>
                  {tasksCompleted}
                  <span className="font-normal text-white/45"> / {tasksTotal} done</span>
                </>
              ) : (
                <>
                  {workoutsThisWeek}
                  <span className="font-normal text-white/45"> / {weeklyTarget} workouts</span>
                </>
              )}
            </p>
          </div>
          <span
            className={[
              'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
              !arcComplete
                ? tasksCompleted === tasksTotal && tasksTotal > 0
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-white/10 text-white/60'
                : weeklyMet
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-white/10 text-white/60',
            ].join(' ')}
          >
            {!arcComplete
              ? tasksCompleted === tasksTotal && tasksTotal > 0
                ? 'All done'
                : 'View tasks'
              : weeklyMet
                ? 'On track'
                : 'Keep going'}
          </span>
        </div>
      </div>
    </button>
  )
}
