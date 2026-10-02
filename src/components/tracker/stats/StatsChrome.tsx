import type { ReactNode } from 'react'

export function StatsCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={[
        'rounded-3xl bg-[#141416] p-4 text-white shadow-sm ring-1 ring-white/10 sm:p-5',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

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
      className="inline-flex rounded-full bg-black/40 p-1 ring-1 ring-white/10"
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
              'rounded-full px-3 py-1 text-xs font-semibold transition',
              selected ? 'bg-white/15 text-white' : 'text-zinc-500 hover:text-zinc-300',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
