import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface SettingsPageLayoutProps {
  title: string
  subtitle?: string
  onBack: () => void
  children: ReactNode
  footer?: ReactNode
}

export function SettingsPageLayout({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: SettingsPageLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:desktop-page-header lg:static lg:px-10 lg:py-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          {subtitle && (
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
              {subtitle}
            </p>
          )}
          <h1 className="text-lg font-semibold lg:text-2xl lg:tracking-tight">{title}</h1>
        </div>
      </header>

      <div className="desktop-page-body mx-auto flex w-full max-w-lg flex-1 flex-col space-y-6 px-5 py-6 lg:max-w-none lg:px-10 lg:pb-10">
        {children}
        {footer ?? (
          <p className="mt-auto pt-6 text-center text-[11px] font-medium tracking-[0.24em] text-muted/80">
            onemorep
          </p>
        )}
      </div>
    </div>
  )
}

export function SettingsSection({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section>
      {title && (
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">{children}</div>
  )
}

export function SettingsRow({
  icon,
  label,
  value,
  onClick,
  destructive,
  success,
  trailing,
}: {
  icon: ReactNode
  label: string
  value?: string
  onClick?: () => void
  destructive?: boolean
  success?: boolean
  trailing?: ReactNode
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition last:border-b-0',
        onClick ? 'hover:bg-surface-elevated/80 active:bg-surface-elevated' : '',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          destructive
            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
            : success
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-surface-elevated text-muted',
        ].join(' ')}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            'block text-sm font-medium',
            destructive ? 'text-red-600 dark:text-red-400' : '',
          ].join(' ')}
        >
          {label}
        </span>
        {value && <span className="block truncate text-xs text-muted">{value}</span>}
      </span>
      {trailing}
    </Tag>
  )
}
