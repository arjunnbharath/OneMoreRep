import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
  children: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200',
  secondary:
    'bg-white text-black hover:bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
  outline:
    'border border-neutral-200 bg-white text-black hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800',
  ghost:
    'bg-transparent text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800',
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
