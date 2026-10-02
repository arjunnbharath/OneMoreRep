import { Bell, Camera } from 'lucide-react'
import { SettingsCard, SettingsPageLayout, SettingsRow, SettingsToggle } from './SettingsUI'
import { useCameraPermission } from '../../hooks/useCameraPermission'
import { usePushNotifications } from '../../hooks/usePushNotifications'

interface PermissionsSettingsProps {
  onBack: () => void
}

export default function PermissionsSettings({ onBack }: PermissionsSettingsProps) {
  const {
    supported,
    available,
    permission: notificationPermission,
    enabled,
    enabling,
    error,
    enable,
    disable,
  } = usePushNotifications()

  const {
    supported: cameraSupported,
    enabled: cameraEnabled,
    active: cameraActive,
    denied: cameraDenied,
    requesting: cameraRequesting,
    enable: enableCamera,
    disable: disableCamera,
  } = useCameraPermission()

  const notificationAvailable = supported && available
  const totalPermissions =
    (notificationAvailable ? 1 : 0) + (cameraSupported ? 1 : 0)
  const activePermissions =
    (enabled ? 1 : 0) + (cameraActive ? 1 : 0)
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

  async function handleCameraToggle() {
    if (cameraRequesting) return
    if (cameraEnabled) {
      disableCamera()
      return
    }
    await enableCamera()
  }

  const notificationsBlocked = notificationPermission === 'denied'
  const notificationsUnavailable = !available
  const anySupported = notificationAvailable || cameraSupported

  return (
    <SettingsPageLayout title="Permissions" subtitle="Settings" onBack={onBack}>
      <p className="px-4 pb-1 text-sm text-muted">{summary}</p>

      {!anySupported ? (
        <SettingsCard>
          <div className="px-4 py-3.5">
            <p className="text-sm text-muted">Permissions are not available on this device.</p>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard>
          {notificationAvailable && (
            <>
              <SettingsRow
                icon={<Bell />}
                label="Notifications"
                value={
                  notificationsUnavailable
                    ? 'Not configured on server'
                    : notificationsBlocked
                      ? 'Blocked in browser settings'
                      : undefined
                }
                trailing={
                  <SettingsToggle
                    checked={enabled}
                    disabled={enabling || notificationsBlocked || notificationsUnavailable}
                    onChange={() => void handleNotificationsToggle()}
                    label="Notifications"
                  />
                }
              />
              {error && (
                <p className="px-4 pb-3 pl-[4.5rem] text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              {notificationsBlocked && (
                <p className="px-4 pb-3 pl-[4.5rem] text-xs text-muted">
                  To turn notifications back on, allow them in your browser&apos;s site settings.
                </p>
              )}
            </>
          )}

          {cameraSupported && (
            <>
              <SettingsRow
                icon={<Camera />}
                label="Camera"
                value={
                  cameraDenied
                    ? 'Blocked in browser settings'
                    : cameraEnabled && !cameraActive
                      ? 'Waiting for browser access'
                      : undefined
                }
                trailing={
                  <SettingsToggle
                    checked={cameraEnabled}
                    disabled={cameraRequesting || (cameraDenied && !cameraEnabled)}
                    onChange={() => void handleCameraToggle()}
                    label="Camera"
                  />
                }
              />
              {cameraDenied && (
                <p className="px-4 pb-3 pl-[4.5rem] text-xs text-muted">
                  Camera is blocked by your browser. Allow it in site settings, then turn it on here.
                </p>
              )}
            </>
          )}
        </SettingsCard>
      )}
    </SettingsPageLayout>
  )
}
