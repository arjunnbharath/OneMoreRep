import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
  children: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground shadow-sm hover:opacity-90 active:opacity-80 dark:shadow-none dark:ring-1 dark:ring-white/10 dark:hover:ring-white/15',
  secondary:
    'bg-surface text-foreground ring-1 ring-border shadow-sm hover:bg-surface-elevated dark:bg-surface-elevated dark:shadow-none dark:ring-white/8',
  outline:
    'border border-border bg-surface/80 text-foreground shadow-sm hover:bg-surface dark:bg-surface/40 dark:shadow-none dark:ring-1 dark:ring-white/8',
  ghost:
    'bg-transparent text-muted hover:bg-surface hover:text-foreground dark:hover:bg-surface-elevated/60',
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold transition-colors disabled:opacity-50',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
