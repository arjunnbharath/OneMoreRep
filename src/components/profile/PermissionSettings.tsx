import { Bell } from 'lucide-react'
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

export default function PermissionSettings() {
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

  async function handleNotificationsToggle() {
    if (enabling) return
    if (enabled) {
      await disable()
      return
    }
    await enable()
  }

  if (!supported) {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
        <div className="px-4 py-3.5">
          <p className="text-sm text-muted">Permissions are not available on this device.</p>
        </div>
      </div>
    )
  }

  const notificationsBlocked = permission === 'denied'
  const notificationsUnavailable = !available

  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium">App permissions</p>
        <p className="mt-0.5 text-xs text-muted">
          {totalPermissions === 0
            ? 'No permissions available'
            : `${activePermissions} of ${totalPermissions} active`}
        </p>
      </div>

      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
          <Bell size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Notifications</span>
          <span className="block text-xs text-muted">
            {notificationsUnavailable
              ? 'Not configured on server'
              : notificationsBlocked
                ? 'Blocked in browser settings'
                : 'Friend waves and workout reminders'}
          </span>
        </div>
        <Toggle
          checked={enabled}
          disabled={enabling || notificationsBlocked || notificationsUnavailable}
          onChange={() => void handleNotificationsToggle()}
          label="Notifications"
        />
      </div>

      {error && (
        <p className="border-t border-border px-4 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {notificationsBlocked && (
        <p className="border-t border-border px-4 py-2 text-xs text-muted">
          To turn notifications back on, allow them in your browser&apos;s site settings.
        </p>
      )}
    </div>
  )
}
