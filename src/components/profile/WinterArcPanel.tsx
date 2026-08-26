import { useState } from 'react'
import { Snowflake } from 'lucide-react'
import {
  DEFAULT_WINTER_ARC_WEEKLY_TARGET,
  WINTER_ARC_DURATION_DAYS,
  formatWinterArcEndDate,
} from '../../lib/winterArc'
import type { WinterArcProgress, WinterArcState } from '../../types/winterArc'
import { SettingsCard, SettingsToggle } from './SettingsUI'

interface WinterArcPanelProps {
  state: WinterArcState
  progress: WinterArcProgress | null
  onEnroll: () => void
  onLeave: () => void
  onShowOnHomeChange: (show: boolean) => void
}

export default function WinterArcPanel({
  state,
  progress,
  onEnroll,
  onLeave,
  onShowOnHomeChange,
}: WinterArcPanelProps) {
  const [confirmLeave, setConfirmLeave] = useState(false)

  if (!state.enrolled) {
    return (
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Challenges
        </h2>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-5 ring-1 ring-border">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Snowflake size={18} className="text-sky-200" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-white">Winter Arc</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {WINTER_ARC_DURATION_DAYS}-day push through the cold season. Hit{' '}
                {DEFAULT_WINTER_ARC_WEEKLY_TARGET} workouts per week and build your streak.
              </p>
              <button
                type="button"
                onClick={onEnroll}
                className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
              >
                Start Winter Arc
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Challenges
      </h2>
      <SettingsCard>
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sky-200 ring-1 ring-border dark:bg-slate-800">
              <Snowflake size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Winter Arc</p>
              {progress ? (
                <p className="mt-1 text-xs text-muted">
                  Day {progress.dayNumber} of {progress.totalDays}
                  {!progress.arcComplete && ` · ends ${formatWinterArcEndDate(progress.endDateKey)}`}
                </p>
              ) : null}
              {progress && (
                <p className="mt-2 text-xs text-muted">
                  This week: {progress.workoutsThisWeek}/{progress.weeklyTarget} workouts
                  {progress.streak > 0 ? ` · ${progress.streak} day streak` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Show on home</p>
            <p className="mt-0.5 text-xs text-muted">Winter Arc card on your dashboard</p>
          </div>
          <SettingsToggle
            checked={state.showOnHome}
            onChange={() => onShowOnHomeChange(!state.showOnHome)}
            label="Show Winter Arc on home"
          />
        </div>

        {confirmLeave ? (
          <div className="border-t border-border bg-red-50/80 px-4 py-4 dark:bg-red-950/20">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Leave Winter Arc?
            </p>
            <p className="mt-1 text-xs text-muted">Your progress stays in workout history.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmLeave(false)}
                className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onLeave()
                  setConfirmLeave(false)
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white"
              >
                Leave
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="w-full border-t border-border px-4 py-3.5 text-left text-sm font-medium text-red-600 transition hover:bg-surface-elevated/80 dark:text-red-400"
          >
            Leave challenge
          </button>
        )}
      </SettingsCard>
    </section>
  )
}
