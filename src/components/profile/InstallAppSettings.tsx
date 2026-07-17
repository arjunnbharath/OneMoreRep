import { Smartphone } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { SettingsRow } from './SettingsUI'

export default function InstallAppSettings({ embedded = false }: { embedded?: boolean }) {
  const {
    showInstallSection,
    installed,
    canInstall,
    isIosBrowser,
    canShowBrowserInstall,
    installing,
    install,
  } = usePwaInstall()

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

  if (canInstall) {
    return (
      <SettingsRow
        icon={<Smartphone size={16} />}
        label={installing ? 'Installing…' : 'Install app'}
        value="Add to your home screen"
        onClick={installing ? undefined : () => void install()}
      />
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

  if (canShowBrowserInstall) {
    return (
      <SettingsRow
        icon={<Smartphone size={16} />}
        label="Install app"
        value="Use your browser menu to install or add to home screen"
      />
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
