import { Activity, Clock, Flame, Weight } from 'lucide-react'
import { getSessionMinutes, sessionVolume } from '../../lib/workoutProgress'
import { computeStreak } from '../../pages/home/homeUtils'
import type { WorkoutSession } from '../../types/tracker'

interface AllTimeStatsHeroProps {
  sessions: WorkoutSession[]
}

function formatVolumeFull(kg: number) {
  return kg.toLocaleString()
}

function formatVolumeCompact(kg: number) {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}M`
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
  return formatVolumeFull(kg)
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return '0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export default function AllTimeStatsHero({ sessions }: AllTimeStatsHeroProps) {
  const workouts = sessions.length
  const volume = sessions.reduce((sum, session) => sum + sessionVolume(session), 0)
  const minutes = sessions.reduce((sum, session) => sum + getSessionMinutes(session), 0)
  const streak = computeStreak(sessions.map((session) => session.date))
  const exerciseCount = sessions.reduce((sum, session) => sum + session.exercises.length, 0)
  const showCompactVolume = volume >= 1000

  const statItems = [
    {
      label: 'Workouts',
      value: String(workouts),
      icon: Activity,
    },
    {
      label: 'Time',
      value: formatDuration(minutes),
      icon: Clock,
    },
    {
      label: 'Streak',
      value: streak > 0 ? `${streak}d` : '0d',
      icon: Flame,
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl text-white ring-1 ring-border">
      <img
        src="/images/gym_background/gym-pic.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 via-black/75 to-black/90" />

      <div className="relative p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              All time
            </p>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-5xl font-semibold leading-none tracking-tight tabular-nums lg:text-6xl">
                {showCompactVolume ? formatVolumeCompact(volume) : formatVolumeFull(volume)}
              </p>
              <p className="pb-1 text-lg font-medium text-white/70">kg</p>
            </div>
            <p className="mt-2 text-sm text-white/65">Total volume lifted</p>
            {showCompactVolume && (
              <p className="mt-1 text-xs tabular-nums text-white/45">
                {formatVolumeFull(volume)} kg lifetime
              </p>
            )}
          </div>

          <div className="hidden shrink-0 rounded-2xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/15 backdrop-blur-sm sm:block">
            <Weight size={16} className="ml-auto text-white/70" />
            <p className="mt-2 text-xl font-semibold tabular-nums leading-none">
              {exerciseCount}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/55">
              Exercises
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
          {statItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl px-2 py-3.5 text-center">
              <Icon size={14} className="mx-auto text-white/55" />
              <p className="mt-2 text-lg font-semibold tabular-nums leading-none lg:text-xl">
                {value}
              </p>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-white/55">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
