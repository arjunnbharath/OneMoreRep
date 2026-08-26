import StatGrid from '../ui/StatGrid'
import { getSessionMinutes, sessionVolume } from '../../lib/workoutProgress'
import { computeStreak } from '../../pages/home/homeUtils'
import type { WorkoutSession } from '../../types/tracker'

interface AllTimeStatsHeroProps {
  sessions: WorkoutSession[]
}

function formatVolume(kg: number) {
  if (kg <= 0) return '0'
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}M`
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
  return kg.toLocaleString()
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

  const items = [
    { value: workouts, label: 'Workouts' },
    { value: formatVolume(volume), label: 'Volume (kg)' },
    { value: streak, label: 'Streak' },
    { value: formatDuration(minutes), label: 'Time' },
  ]

  return <StatGrid items={items} />
}
