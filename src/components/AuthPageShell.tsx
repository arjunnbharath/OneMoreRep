import type { ReactNode } from 'react'

interface AuthPageShellProps {
  children: ReactNode
  className?: string
}

export default function AuthPageShell({ children, className = '' }: AuthPageShellProps) {
  return (
    <div
      className={['dark min-h-dvh bg-background text-foreground', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
