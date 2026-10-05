import { ChevronRight } from 'lucide-react'
import FireEmoji from '../ui/FireEmoji'
import WinterSnow from '../winter-arc/WinterSnow'
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
      className="relative w-full overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_85%_0%,#1d4ed8_0%,#0f172a_60%,#020617_100%)] text-left outline-none"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-400/20 blur-3xl"
        aria-hidden
      />
      <WinterSnow />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Winter Arc
            </p>
            {arcComplete ? (
              <p className="mt-0.5 text-xl font-semibold tracking-tight text-white">Arc complete</p>
            ) : (
              <p className="mt-0.5 text-xl font-semibold tracking-tight text-white">
                Day {dayNumber}
                <span className="ml-1 text-base font-normal text-white/45">/ {totalDays}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-white/55">
              {arcComplete
                ? `${totalWorkouts} workouts logged during your arc`
                : `Ends ${formatWinterArcEndDate(endDateKey)}`}
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

        <div
          className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Arc progress"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
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
