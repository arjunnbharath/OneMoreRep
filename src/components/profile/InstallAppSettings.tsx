import { Smartphone } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'

export default function InstallAppSettings() {
  const {
    showInstallSection,
    installed,
    canInstall,
    isIosBrowser,
    canShowBrowserInstall,
    installing,
    install,
  } = usePwaInstall()

  if (!showInstallSection) return null

  let content = null

  if (installed) {
    content = (
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Smartphone size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium">App installed</span>
          <span className="block text-xs text-muted">OneMoreRep is on this device</span>
        </div>
      </div>
    )
  } else if (canInstall) {
    content = (
      <button
        type="button"
        onClick={() => void install()}
        disabled={installing}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80 disabled:opacity-60"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
          <Smartphone size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium">
            {installing ? 'Installing…' : 'Install app'}
          </span>
          <span className="block text-xs text-muted">Add to your home screen</span>
        </div>
      </button>
    )
  } else if (isIosBrowser) {
    content = (
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
          <Smartphone size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Install app</span>
          <span className="mt-1 block text-xs text-muted">
            Tap Share in Safari, then &quot;Add to Home Screen&quot;.
          </span>
        </div>
      </div>
    )
  } else if (canShowBrowserInstall) {
    content = (
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
          <Smartphone size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Install app</span>
          <span className="mt-1 block text-xs text-muted">
            Use your browser menu to install or add to home screen.
          </span>
        </div>
      </div>
    )
  }

  if (!content) return null

  return <div className="border-b border-border">{content}</div>
}
