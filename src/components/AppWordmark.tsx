interface AppWordmarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AppWordmark({ className = '', size = 'sm' }: AppWordmarkProps) {
  return (
    <p
      className={[
        'font-semibold uppercase tracking-[0.18em] text-muted',
        size === 'lg'
          ? 'text-sm tracking-[0.2em]'
          : size === 'md'
            ? 'text-xs tracking-[0.2em]'
            : 'text-[11px]',
        className,
      ].join(' ')}
    >
      OneMoreRep
    </p>
  )
}
