import { Download, Smartphone, Trash2 } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { isNativeApp } from '../../lib/pwaInstall'
import { uninstallNativeApp } from '../../lib/nativeAppActions'
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

  if (isNativeApp()) {
    return (
      <SettingsRow
        icon={<Trash2 size={16} />}
        label="Uninstall app"
        value="Remove OneMoreRep from this phone"
        destructive
        onClick={() => void uninstallNativeApp()}
      />
    )
  }

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
        value="OneMoreRep is on this device"
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
          value="Download the Android app (APK), then tap it to install"
          onClick={downloadApk}
        />
        {canInstall && (
          <SettingsRow
            icon={<Smartphone size={16} />}
            label={installing ? 'Adding…' : 'Add to home screen'}
            value="Lightweight web version instead"
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
      label="Android app (APK)"
      value="Download to install on an Android phone"
      onClick={downloadApk}
    />
  )

  if (canInstall) {
    return (
      <>
        <SettingsRow
          icon={<Smartphone size={16} />}
          label={installing ? 'Installing…' : 'Install app'}
          value="Add to your home screen"
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
          value="Use your browser menu to install or add to home screen"
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
