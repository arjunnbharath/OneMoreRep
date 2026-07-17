import type { ReactNode } from 'react'

interface GeminiSelectCardProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  innerClassName?: string
  rounded?: string
}

export default function GeminiSelectCard({
  selected,
  onClick,
  children,
  innerClassName = '',
  rounded = 'rounded-2xl',
}: GeminiSelectCardProps) {
  const innerRadius = rounded === 'rounded-2xl' ? 'rounded-[14px]' : rounded

  return (
    <button type="button" onClick={onClick} className="w-full text-left transition">
      {selected ? (
        <div className={`onboarding-day-glow p-[2px] ${rounded}`}>
          <div className={`bg-surface dark:bg-background ${innerRadius} ${innerClassName}`}>{children}</div>
        </div>
      ) : (
        <div
          className={`onboarding-option bg-surface ring-1 ring-border transition hover:ring-foreground/20 dark:bg-surface dark:shadow-none ${rounded} ${innerClassName}`}
        >
          {children}
        </div>
      )}
    </button>
  )
}
