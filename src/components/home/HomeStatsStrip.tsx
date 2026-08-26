import StatGrid from '../ui/StatGrid'

interface HomeStatsStripProps {
  stats: { streak: number; thisWeek: number }
  sessionCount: number
  todayCalories: number
}

function formatCalories(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

export default function HomeStatsStrip({
  stats,
  sessionCount,
  todayCalories,
}: HomeStatsStripProps) {
  const items = [
    { value: stats.streak, label: 'Streak' },
    { value: sessionCount, label: 'Sessions' },
    { value: formatCalories(todayCalories), label: 'Intake' },
  ]

  return <StatGrid items={items} data-tour="home-stats" compact />
}
