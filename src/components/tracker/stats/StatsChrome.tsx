import type { ReactNode } from 'react'

/** Material 3 surface card used by every stats block. */
export function StatsCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={['rounded-[1.5rem] bg-surface p-4 text-foreground sm:p-5', className].join(' ')}>
      {children}
    </section>
  )
}

/** Material segmented control: filled pill for the selected range. */
export function StatsPills<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (next: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-full bg-background p-1"
    >
      {options.map((option) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={[
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition',
              selected ? 'bg-foreground text-background' : 'text-muted',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
