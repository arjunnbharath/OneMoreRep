import { ArrowLeft, Bell } from 'lucide-react'
import { SettingsCard, SettingsPageLayout, SettingsRow } from './SettingsUI'
import { usePushNotifications } from '../../hooks/usePushNotifications'

function Toggle({
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
        'relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50',
        checked ? 'bg-foreground' : 'bg-border',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-background shadow transition',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

interface PermissionsSettingsProps {
  onBack: () => void
}

export default function PermissionsSettings({ onBack }: PermissionsSettingsProps) {
  const {
    supported,
    available,
    permission,
    enabled,
    enabling,
    error,
    enable,
    disable,
  } = usePushNotifications()

  const totalPermissions = supported && available ? 1 : 0
  const activePermissions = enabled ? 1 : 0
  const summary =
    totalPermissions === 0
      ? 'No permissions available'
      : `${activePermissions} of ${totalPermissions} active`

  async function handleNotificationsToggle() {
    if (enabling) return
    if (enabled) {
      await disable()
      return
    }
    await enable()
  }

  const notificationsBlocked = permission === 'denied'
  const notificationsUnavailable = !available

  return (
    <SettingsPageLayout title="Permissions" subtitle="Settings" onBack={onBack}>
      <p className="px-1 text-sm text-muted">{summary}</p>

      {!supported ? (
        <SettingsCard>
          <div className="px-4 py-3.5">
            <p className="text-sm text-muted">Permissions are not available on this device.</p>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard>
          <SettingsRow
            icon={<Bell size={16} />}
            label="Notifications"
            value={
              notificationsUnavailable
                ? 'Not configured on server'
                : notificationsBlocked
                  ? 'Blocked in browser settings'
                  : 'Friend waves and workout reminders'
            }
            trailing={
              <Toggle
                checked={enabled}
                disabled={enabling || notificationsBlocked || notificationsUnavailable}
                onChange={() => void handleNotificationsToggle()}
                label="Notifications"
              />
            }
          />
          {error && (
            <p className="border-t border-border px-4 py-2.5 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {notificationsBlocked && (
            <p className="border-t border-border px-4 py-2.5 text-xs text-muted">
              To turn notifications back on, allow them in your browser&apos;s site settings.
            </p>
          )}
        </SettingsCard>
      )}
    </SettingsPageLayout>
  )
}
