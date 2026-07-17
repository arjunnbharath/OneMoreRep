import type { ReactNode } from 'react'
import { ArrowLeft, Bell, ChevronRight, Database, LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import InstallAppSettings from './InstallAppSettings'
import { usePushNotifications } from '../../hooks/usePushNotifications'

function SettingsRow({
  icon,
  label,
  value,
  onClick,
  destructive,
}: {
  icon: ReactNode
  label: string
  value?: string
  onClick?: () => void
  destructive?: boolean
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition',
        onClick ? 'hover:bg-surface-elevated/80 active:bg-surface-elevated' : '',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          destructive
            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
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
      {onClick && !destructive && <ChevronRight size={16} className="shrink-0 text-muted" />}
    </Tag>
  )
}

interface SettingsHubProps {
  isDark: boolean
  onBack: () => void
  onOpenAccount: () => void
  onOpenData: () => void
  onOpenPermissions: () => void
  onLogout: () => void
  setTheme: (mode: 'light' | 'dark') => void
}

export default function SettingsHub({
  isDark,
  onBack,
  onOpenAccount,
  onOpenData,
  onOpenPermissions,
  onLogout,
  setTheme,
}: SettingsHubProps) {
  const { supported, available, enabled } = usePushNotifications()

  const permissionsSummary =
    supported && available ? `${enabled ? 1 : 0} of 1 active` : 'Not available'

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to profile"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold">Settings</h1>
      </header>

      <div className="desktop-page mx-auto max-w-lg space-y-6 px-5 py-6 lg:max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-muted">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </span>
              <span className="text-sm font-medium">Appearance</span>
            </div>
            <div className="flex rounded-xl bg-background p-0.5 ring-1 ring-border">
              {(['light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition',
                    (mode === 'dark') === isDark
                      ? 'bg-foreground text-background'
                      : 'text-muted',
                  ].join(' ')}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-border">
            <SettingsRow
              icon={<User size={16} />}
              label="Account"
              value="Details, password, delete"
              onClick={onOpenAccount}
            />
          </div>

          <div className="border-b border-border">
            <SettingsRow
              icon={<Database size={16} />}
              label="Data"
              value="Export or clear your data"
              onClick={onOpenData}
            />
          </div>

          <div className="border-b border-border">
            <SettingsRow
              icon={<Bell size={16} />}
              label="Permissions"
              value={permissionsSummary}
              onClick={onOpenPermissions}
            />
          </div>

          <InstallAppSettings />

          <SettingsRow
            icon={<LogOut size={16} />}
            label="Log out"
            destructive
            onClick={onLogout}
          />
        </div>
      </div>
    </div>
  )
}

export function ProfileSettingsEntry({ onClick }: { onClick: () => void }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Settings
      </h2>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left ring-1 ring-border transition hover:ring-foreground/15"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
          <Settings size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Settings</span>
          <span className="block text-xs text-muted">Account, data, permissions</span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-muted" />
      </button>
    </section>
  )
}
