import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
}

export default function Input({ label, icon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            'w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8 dark:bg-surface-elevated dark:shadow-none dark:border-white/10 dark:focus:border-white/25 dark:focus:ring-white/10',
            icon ? 'pl-11' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
    </div>
  )
}
