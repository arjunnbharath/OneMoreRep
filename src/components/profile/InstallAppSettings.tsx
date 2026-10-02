import { Download, Smartphone } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { isNativeApp } from '../../lib/pwaInstall'
import { SettingsRow } from './SettingsUI'

export default function InstallAppSettings({ embedded = false }: { embedded?: boolean }) {
  const {
    showInstallSection,
    installed,
    canInstall,
    isIosBrowser,
    isAndroidBrowser,
    canShowBrowserInstall,
    installing,
    install,
    downloadApk,
  } = usePwaInstall()

  // Inside the installed Android app there is nothing to install; updates are
  // handled by AppUpdateSettings.
  if (isNativeApp()) return null

  if (!showInstallSection) {
    if (embedded) {
      return (
        <div className="px-4 py-3.5">
          <p className="text-sm text-muted">Install is not available on this device.</p>
        </div>
      )
    }
    return null
  }

  if (installed) {
    return (
      <SettingsRow
        icon={<Smartphone size={16} />}
        label="App installed"
        success
      />
    )
  }

  // Android phone in a browser: "Install app" downloads the APK, which hands
  // off to the Android package installer.
  if (isAndroidBrowser) {
    return (
      <>
        <SettingsRow
          icon={<Download size={16} />}
          label="Install app"
          onClick={downloadApk}
        />
        {canInstall && (
          <SettingsRow
            icon={<Smartphone size={16} />}
            label={installing ? 'Adding…' : 'Add to home screen'}
            onClick={installing ? undefined : () => void install()}
          />
        )}
      </>
    )
  }

  if (isIosBrowser) {
    return (
      <SettingsRow
        icon={<Smartphone size={16} />}
        label="Install app"
        value='Tap Share in Safari, then "Add to Home Screen"'
      />
    )
  }

  // Desktop / other browsers: PWA install plus a link to grab the Android APK.
  const apkRow = (
    <SettingsRow
      icon={<Download size={16} />}
      label="Android app"
      onClick={downloadApk}
    />
  )

  if (canInstall) {
    return (
      <>
        <SettingsRow
          icon={<Smartphone size={16} />}
          label={installing ? 'Installing…' : 'Install app'}
          onClick={installing ? undefined : () => void install()}
        />
        {apkRow}
      </>
    )
  }

  if (canShowBrowserInstall) {
    return (
      <>
        <SettingsRow
          icon={<Smartphone size={16} />}
          label="Install app"
        />
        {apkRow}
      </>
    )
  }

  if (embedded) {
    return (
      <div className="px-4 py-3.5">
        <p className="text-sm text-muted">Install is not available on this device.</p>
      </div>
    )
  }

  return null
}
