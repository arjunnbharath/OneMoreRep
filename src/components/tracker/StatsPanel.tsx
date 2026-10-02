import { ChevronRight, Dumbbell } from 'lucide-react'
import ActivityHeatmap from './stats/ActivityHeatmap'
import BodyWeightCard from './stats/BodyWeightCard'
import EffortCard from './stats/EffortCard'
import ExerciseProgressCard from './stats/ExerciseProgressCard'
import MuscleBalanceCard from './stats/MuscleBalanceCard'
import RecentWorkoutsCard from './stats/RecentWorkoutsCard'
import type { WorkoutSession } from '../../types/tracker'

interface StatsPanelProps {
  sessions: WorkoutSession[]
  activeSession: WorkoutSession | null
  onOpenWorkout: () => void
}

export default function StatsPanel({ sessions, activeSession, onOpenWorkout }: StatsPanelProps) {
  if (sessions.length === 0) {
    return (
      <section className="overflow-x-hidden space-y-6 px-5 pb-8 pt-4 lg:desktop-page-body lg:px-10 lg:pt-6">
        <div className="desktop-page mx-auto max-w-lg lg:max-w-2xl">
          <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border" data-tour="stats-overview">
            <div className="relative px-6 pb-8 pt-10 text-center">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-emerald-500/15 via-transparent to-sky-500/10"
                aria-hidden
              />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-background ring-1 ring-border">
                <BarChartPlaceholder />
              </div>
              <h2 className="relative mt-5 text-xl font-semibold tracking-tight">
                No stats yet
              </h2>
              <p className="relative mx-auto mt-2 max-w-xs text-sm text-muted">
                Finish a workout to see them here.
              </p>
              <button
                type="button"
                onClick={onOpenWorkout}
                className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <Dumbbell size={16} />
                Start a workout
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-x-hidden space-y-4 px-5 pb-8 pt-4 lg:desktop-page-body lg:px-10 lg:pt-6">
      <div className="desktop-page mx-auto max-w-lg space-y-4 lg:max-w-3xl" data-tour="stats-overview">
        {activeSession && (
          <button
            type="button"
            onClick={onOpenWorkout}
            className="group flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-foreground p-4 text-left text-background transition hover:opacity-95"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/15 ring-1 ring-background/20">
              <Dumbbell size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-background/60">
                Active session
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold">{activeSession.name}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-background/70" />
          </button>
        )}

        <ActivityHeatmap sessions={sessions} />
        <MuscleBalanceCard sessions={sessions} />
        <EffortCard sessions={sessions} />
        <BodyWeightCard />
        <ExerciseProgressCard sessions={sessions} />
        <RecentWorkoutsCard sessions={sessions} />
      </div>
    </section>
  )
}

function BarChartPlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="18" width="5" height="10" rx="1.5" className="fill-foreground/30" />
      <rect x="11" y="12" width="5" height="16" rx="1.5" className="fill-foreground/50" />
      <rect x="18" y="8" width="5" height="20" rx="1.5" className="fill-foreground/70" />
      <rect x="25" y="14" width="5" height="14" rx="1.5" className="fill-foreground" />
    </svg>
  )
}
