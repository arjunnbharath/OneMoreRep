import { ArrowLeft } from 'lucide-react'
import PermissionSettings from './PermissionSettings'

interface PermissionsSettingsProps {
  onBack: () => void
}

export default function PermissionsSettings({ onBack }: PermissionsSettingsProps) {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold">Permissions</h1>
      </header>

      <div className="desktop-page mx-auto max-w-lg px-5 py-6 lg:max-w-2xl">
        <PermissionSettings />
      </div>
    </div>
  )
}
