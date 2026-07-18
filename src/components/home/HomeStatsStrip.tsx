interface HomeStatsStripProps {
  stats: { completed: number; minutes: number; streak: number }
  todayCalories: number
}

function formatCalories(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

export default function HomeStatsStrip({ stats, todayCalories }: HomeStatsStripProps) {
  const items = [
    { value: stats.streak, label: 'Streak' },
    { value: stats.minutes, label: 'Min' },
    { value: stats.completed, label: 'Sessions' },
    { value: formatCalories(todayCalories), label: 'Intake' },
  ]

  return (
    <div data-tour="home-stats" className="flex divide-x divide-border rounded-xl bg-surface py-2 ring-1 ring-border">
      {items.map(({ value, label }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-0.5 px-1">
          <span className="text-sm font-semibold leading-none tabular-nums">{value}</span>
          <span className="text-[9px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}
