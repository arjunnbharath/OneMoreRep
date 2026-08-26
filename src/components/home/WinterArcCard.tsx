import { ChevronRight, Snowflake } from 'lucide-react'
import FireEmoji from '../ui/FireEmoji'
import { formatWinterArcEndDate } from '../../lib/winterArc'
import type { WinterArcProgress } from '../../types/winterArc'

interface WinterArcCardProps {
  progress: WinterArcProgress
  tasksCompleted: number
  tasksTotal: number
  pendingHabits: string[]
  onOpen: () => void
}

export default function WinterArcCard({
  progress,
  tasksCompleted,
  tasksTotal,
  pendingHabits,
  onOpen,
}: WinterArcCardProps) {
  const {
    dayNumber,
    totalDays,
    daysRemaining,
    streak,
    arcComplete,
    progressPercent,
    endDateKey,
    totalWorkouts,
  } = progress

  const allDone = tasksTotal > 0 && tasksCompleted === tasksTotal

  return (
    <button
      type="button"
      onClick={onOpen}
      data-tour="winter-arc"
      className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-left ring-1 ring-white/10 outline-none"
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
              <span className="text-lg font-bold tabular-nums leading-none text-white">
                {streak}
                <FireEmoji size={18} />
              </span>
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

        {!arcComplete && tasksTotal > 0 && (
          <div className="mt-4 rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                Daily habits
              </p>
              <p className="text-sm font-semibold tabular-nums text-white">
                {tasksCompleted}/{tasksTotal}
              </p>
            </div>
            {allDone ? (
              <p className="mt-1.5 text-xs font-medium text-emerald-200">All done today</p>
            ) : (
              <p className="mt-1.5 truncate text-xs text-white/70">
                {pendingHabits.join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
