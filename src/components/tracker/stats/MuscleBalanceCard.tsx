import { useMemo, useState } from 'react'
import {
  BACK_MUSCLES,
  FRONT_MUSCLES,
  muscleStats,
  STAT_MUSCLE_LABELS,
  type MuscleRange,
  type StatMuscle,
} from '../../../lib/statsInsights'
import type { WorkoutSession } from '../../../types/tracker'
import MuscleFigure from './MuscleFigure'
import { StatsCard, StatsPills } from './StatsChrome'

type MuscleTab = 'balance' | 'fatigue' | 'strength'

const RANGES: { id: MuscleRange; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'all', label: 'All' },
]

interface MuscleBalanceCardProps {
  sessions: WorkoutSession[]
}

export default function MuscleBalanceCard({ sessions }: MuscleBalanceCardProps) {
  const [tab, setTab] = useState<MuscleTab>('balance')
  const [range, setRange] = useState<MuscleRange>('week')
  const stats = useMemo(() => muscleStats(sessions, range), [sessions, range])

  const tone = tab === 'strength' ? 'blue' : tab === 'fatigue' ? 'amber' : 'green'
  const valueOf = (muscle: StatMuscle) => {
    const stat = stats.find((item) => item.muscle === muscle)
    if (!stat) return 0
    return tab === 'strength' ? stat.bestKg : stat.sets
  }
  const max = Math.max(...stats.map((stat) => (tab === 'strength' ? stat.bestKg : stat.sets)), 0)
  const intensity = Object.fromEntries(
    stats.map((stat) => [stat.muscle, max === 0 ? 0 : valueOf(stat.muscle) / max]),
  ) as Partial<Record<StatMuscle, number>>

  const ranked = stats
    .filter((stat) => valueOf(stat.muscle) > 0)
    .sort((a, b) => valueOf(b.muscle) - valueOf(a.muscle))
  const quiet = stats.filter((stat) => valueOf(stat.muscle) <= 0)

  const unit = tab === 'strength' ? 'kg' : 'sets'
  const subtitle =
    tab === 'balance'
      ? 'Muscle balance · by sets worked'
      : tab === 'fatigue'
        ? 'Fatigue · sets logged in this period'
        : 'Strength · best estimated 1RM'

  return (
    <StatsCard>
      <div className="flex gap-1 rounded-2xl bg-black/40 p-1 ring-1 ring-white/10">
        {(
          [
            ['balance', 'Muscle balance'],
            ['fatigue', 'Fatigue'],
            ['strength', 'Strength'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'flex-1 rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm',
              tab === id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-zinc-400">{subtitle}</p>

      <div className="mt-3">
        <StatsPills value={range} options={RANGES} onChange={setRange} ariaLabel="Muscle period" />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <MuscleFigure
          side="front"
          tone={tone}
          intensity={Object.fromEntries(FRONT_MUSCLES.map((muscle) => [muscle, intensity[muscle] ?? 0]))}
        />
        <MuscleFigure
          side="back"
          tone={tone}
          intensity={Object.fromEntries(BACK_MUSCLES.map((muscle) => [muscle, intensity[muscle] ?? 0]))}
        />
      </div>

      {ranked.length === 0 ? (
        <p className="mt-2 text-center text-sm text-zinc-500">No sets in this period yet.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {ranked.slice(0, 6).map((stat) => {
            const value = valueOf(stat.muscle)
            const width = max === 0 ? 0 : Math.max(8, Math.round((value / max) * 100))
            const label =
              tab === 'strength'
                ? `${stat.bestKg % 1 === 0 ? stat.bestKg.toFixed(0) : stat.bestKg} ${unit}`
                : `${stat.sets % 1 === 0 ? stat.sets : stat.sets.toFixed(1)} ${unit}`
            return (
              <li key={stat.muscle}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{STAT_MUSCLE_LABELS[stat.muscle]}</span>
                  <span className="text-xs text-zinc-400">{label}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={[
                      'h-full rounded-full',
                      tone === 'blue' ? 'bg-sky-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-emerald-400',
                    ].join(' ')}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {quiet.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-zinc-500">Not trained in this period</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quiet.map((stat) => (
              <span
                key={stat.muscle}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium text-amber-200/80 ring-1 ring-amber-700/50"
              >
                {STAT_MUSCLE_LABELS[stat.muscle]}
              </span>
            ))}
          </div>
        </div>
      )}
    </StatsCard>
  )
}
