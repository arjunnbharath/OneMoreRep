import type { ReactNode } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { useWindowScrolled } from '../../hooks/useWindowScrolled'

/**
 * Android-style (Material 3) settings header: a pinned top app bar with a
 * round back button, then a large page title. Once the page scrolls the large
 * title slides away and a compact title fades into the bar while the content
 * passes underneath it. The status-bar inset is included.
 */
export function SettingsHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string
  subtitle?: string
  onBack: () => void
}) {
  const collapsed = useWindowScrolled(48)

  return (
    <header className="shrink-0 lg:desktop-page-header lg:px-10 lg:py-6">
      <div
        className={[
          'fixed inset-x-0 top-0 z-30 flex h-[calc(var(--sat)+3.75rem)] items-center gap-1 px-2 pt-[var(--sat)] transition-colors duration-200 lg:hidden',
          collapsed ? 'bg-background/85 backdrop-blur-md' : 'bg-background',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-foreground transition active:bg-foreground/10"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>
        <p
          aria-hidden={!collapsed}
          className={[
            'min-w-0 truncate text-[1.375rem] font-normal tracking-tight transition-all duration-200',
            collapsed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          ].join(' ')}
        >
          {title}
        </p>
      </div>
      <div className="h-[calc(var(--sat)+3.75rem)] lg:hidden" aria-hidden />
      <h1
        className={[
          'px-6 pb-4 pt-2 text-[2rem] font-normal leading-tight tracking-tight transition-opacity duration-200 lg:hidden',
          collapsed ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        {title}
      </h1>

      <div className="hidden items-center gap-3 lg:flex">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          {subtitle && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {subtitle}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      </div>
    </header>
  )
}

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
      <SettingsHeader title={title} subtitle={subtitle} onBack={onBack} />

      <div className="desktop-page-body mx-auto flex w-full max-w-lg flex-1 flex-col space-y-3 px-3 pb-6 lg:max-w-none lg:space-y-6 lg:px-10 lg:pb-10">
        {children}
        {footer ?? (
          <p className="mt-auto pt-8 text-center text-[11px] font-medium tracking-[0.24em] text-muted/70">
            ONEMOREREP
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
        <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">{title}</h2>
      )}
      {children}
    </section>
  )
}

/** Rounded Material 3 list group. */
export function SettingsCard({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[1.5rem] bg-surface">{children}</div>
}

/** Material 3 switch: outlined track when off, filled track + check thumb when on. */
export function SettingsToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative h-8 w-[3.25rem] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40',
        checked
          ? 'bg-foreground'
          : 'bg-surface-elevated ring-2 ring-inset ring-muted/60',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200',
          checked
            ? 'left-[calc(100%-1.75rem)] h-6 w-6 bg-background text-foreground'
            : 'left-2 h-4 w-4 bg-muted',
        ].join(' ')}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  )
}

/** Two-line Material list item with a tinted leading icon. */
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
        'flex w-full items-center gap-4 px-4 text-left transition-colors',
        value ? 'min-h-[4.5rem] py-3' : 'min-h-14 py-2.5',
        onClick ? 'hover:bg-foreground/[0.04] active:bg-foreground/[0.08]' : '',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&>svg]:h-5 [&>svg]:w-5',
          destructive
            ? 'bg-red-500/12 text-red-600 dark:text-red-400'
            : success
              ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
              : 'bg-foreground/[0.07] text-foreground',
        ].join(' ')}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            'block text-base leading-6',
            destructive ? 'text-red-600 dark:text-red-400' : 'text-foreground',
          ].join(' ')}
        >
          {label}
        </span>
        {value && <span className="block text-sm leading-5 text-muted">{value}</span>}
      </span>
      {trailing}
    </Tag>
  )
}
