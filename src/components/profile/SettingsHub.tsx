import { Bell, ChevronRight, Database, LogOut, Map, Moon, Settings, ShieldCheck, Sun, User } from 'lucide-react'
import AppUpdateSettings from './AppUpdateSettings'
import InstallAppSettings from './InstallAppSettings'
import {
  SettingsCard,
  SettingsPageLayout,
  SettingsRow,
  SettingsSection,
  SettingsToggle,
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
  isLocal?: boolean
  hasAdminAccess?: boolean
  onOpenAdmin?: () => void
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
  hasAdminAccess,
  onOpenAdmin,
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
      <SettingsSection title="Display">
        <SettingsCard>
          <SettingsRow
            icon={isDark ? <Moon /> : <Sun />}
            label="Dark theme"
            value={isDark ? 'On' : 'Off'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            trailing={
              <SettingsToggle
                checked={isDark}
                onChange={() => setTheme(isDark ? 'light' : 'dark')}
                label="Dark theme"
              />
            }
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsCard>
          {hasAdminAccess && onOpenAdmin && (
            <SettingsRow
              icon={<ShieldCheck size={16} className="text-green-600 dark:text-green-400" />}
              label="Admin panel"
              onClick={onOpenAdmin}
              trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
            />
          )}
          <SettingsRow
            icon={<User size={16} />}
            label="Account"
            onClick={onOpenAccount}
            trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
          />
          <SettingsRow
            icon={<Database size={16} />}
            label="Data"
            onClick={onOpenData}
            trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
          />
          <SettingsRow
            icon={<Bell size={16} />}
            label="Permissions"
            value={permissionsSummary}
            onClick={onOpenPermissions}
            trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="App">
        <SettingsCard>
          {onReplayTour && (
            <SettingsRow
              icon={<Map size={16} />}
              label="Replay app tour"
              onClick={onReplayTour}
              trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
            />
          )}
          <AppUpdateSettings />
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
    <SettingsSection title="Settings">
      <SettingsCard>
        <SettingsRow
          icon={<Settings />}
          label="Settings"
          onClick={onClick}
          trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
        />
      </SettingsCard>
    </SettingsSection>
  )
}
