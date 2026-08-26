export interface StatItem {
  value: string | number
  label: string
}

interface StatGridProps {
  items: StatItem[]
  variant?: 'default' | 'light'
  compact?: boolean
  className?: string
  'data-tour'?: string
}

export default function StatGrid({
  items,
  variant = 'default',
  compact = false,
  className = '',
  'data-tour': dataTour,
}: StatGridProps) {
  const count = items.length
  const colClass =
    count === 2
      ? 'grid-cols-2'
      : count === 4
        ? compact
          ? 'grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-4'
        : 'grid-cols-3'

  return (
    <div
      data-tour={dataTour}
      className={[
        'grid divide-x divide-border overflow-hidden rounded-2xl ring-1',
        colClass,
        variant === 'light'
          ? 'divide-white/10 bg-white/10 ring-white/15 backdrop-blur-md'
          : 'divide-border bg-surface ring-border',
        className,
      ].join(' ')}
    >
      {items.map(({ value, label }) => (
        <div
          key={label}
          className={[
            'flex flex-col items-center justify-center text-center',
            compact ? 'px-1 py-3 sm:px-2 sm:py-3.5' : 'px-2 py-3.5 sm:px-3 sm:py-4',
          ].join(' ')}
        >
          <span
            className={[
              'font-semibold tabular-nums tracking-tight',
              compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg',
              variant === 'light' ? 'text-white' : 'text-foreground',
            ].join(' ')}
          >
            {value}
          </span>
          <span
            className={[
              'mt-0.5 leading-tight',
              compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px]',
              variant === 'light' ? 'text-white/55' : 'text-muted',
            ].join(' ')}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
