import { Bell, ChevronRight, Database, LogOut, Map, Moon, Settings, Sun, User } from 'lucide-react'
import InstallAppSettings from './InstallAppSettings'
import {
  SettingsCard,
  SettingsPageLayout,
  SettingsRow,
  SettingsSection,
} from './SettingsUI'
import { useCameraPermission } from '../../hooks/useCameraPermission'
import { usePushNotifications } from '../../hooks/usePushNotifications'

interface SettingsHubProps {
  isDark: boolean
  onBack: () => void
  onOpenAccount: () => void
  onOpenData: () => void
  onOpenPermissions: () => void
  onLogout: () => void
  onReplayTour?: () => void
  setTheme: (mode: 'light' | 'dark') => void
}

export default function SettingsHub({
  isDark,
  onBack,
  onOpenAccount,
  onOpenData,
  onOpenPermissions,
  onLogout,
  onReplayTour,
  setTheme,
}: SettingsHubProps) {
  const { supported, available, enabled } = usePushNotifications()
  const { supported: cameraSupported, active: cameraActive } = useCameraPermission()

  const totalPermissions = (supported && available ? 1 : 0) + (cameraSupported ? 1 : 0)
  const activePermissions = (enabled ? 1 : 0) + (cameraActive ? 1 : 0)
  const permissionsSummary =
    totalPermissions === 0
      ? 'Not available'
      : `${activePermissions} of ${totalPermissions} active`

  return (
    <SettingsPageLayout title="Settings" subtitle="Profile" onBack={onBack}>
      <SettingsSection title="General">
        <SettingsCard>
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </span>
              <span className="block text-sm font-medium">Appearance</span>
            </div>
            <div className="flex shrink-0 rounded-xl bg-background p-0.5 ring-1 ring-border">
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
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsCard>
          <SettingsRow
            icon={<User size={16} />}
            label="Account"
            value="Details, password, delete"
            onClick={onOpenAccount}
            trailing={<ChevronRight size={16} className="shrink-0 text-muted" />}
          />
          <SettingsRow
            icon={<Database size={16} />}
            label="Data"
            value="Export or clear your data"
            onClick={onOpenData}
            trailing={<ChevronRight size={16} className="shrink-0 text-muted" />}
          />
          <SettingsRow
            icon={<Bell size={16} />}
            label="Permissions"
            value={permissionsSummary}
            onClick={onOpenPermissions}
            trailing={<ChevronRight size={16} className="shrink-0 text-muted" />}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="App">
        <SettingsCard>
          {onReplayTour && (
            <SettingsRow
              icon={<Map size={16} />}
              label="Replay app tour"
              value="Walk through plans, workouts, and stats"
              onClick={onReplayTour}
              trailing={<ChevronRight size={16} className="shrink-0 text-muted" />}
            />
          )}
          <InstallAppSettings embedded />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <SettingsCard>
          <SettingsRow
            icon={<LogOut size={16} />}
            label="Log out"
            destructive
            onClick={onLogout}
          />
        </SettingsCard>
      </SettingsSection>
    </SettingsPageLayout>
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
