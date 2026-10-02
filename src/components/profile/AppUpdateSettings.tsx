import { CheckCircle2, Download, RefreshCw } from 'lucide-react'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { SettingsRow } from './SettingsUI'

/** "Check for updates" / "Update available" row for the installed Android app. */
export default function AppUpdateSettings() {
  const { supported, status, installed, latest, error, check, install } = useAppUpdate()

  if (!supported) return null

  const current = installed ? `v${installed.versionName}` : ''

  switch (status) {
    case 'available':
      return (
        <SettingsRow
          icon={<Download size={16} />}
          label={`Update to v${latest?.versionName ?? ''}`}
          value={latest?.notes || undefined}
          success
          onClick={() => void install()}
        />
      )
    case 'downloading':
      return (
        <SettingsRow
          icon={<RefreshCw size={16} className="animate-spin" />}
          label="Downloading update…"
        />
      )
    case 'installing':
      return (
        <SettingsRow
          icon={<Download size={16} />}
          label="Open installer"
          onClick={() => void install()}
        />
      )
    case 'permission-required':
      return (
        <SettingsRow
          icon={<Download size={16} />}
          label="Allow installs, then tap again"
          onClick={() => void install()}
        />
      )
    case 'checking':
      return (
        <SettingsRow
          icon={<RefreshCw size={16} className="animate-spin" />}
          label="Checking for updates…"
          value={current}
        />
      )
    case 'up-to-date':
      return (
        <SettingsRow
          icon={<CheckCircle2 size={16} />}
          label="Up to date"
          value={current}
          success
          onClick={() => void check()}
        />
      )
    case 'unconfigured':
      return (
        <SettingsRow
          icon={<RefreshCw size={16} />}
          label="Check for updates"
          value={current}
        />
      )
    case 'error':
      return (
        <SettingsRow
          icon={<RefreshCw size={16} />}
          label="Check for updates"
          value={error ?? 'Tap to retry'}
          onClick={() => void check()}
        />
      )
    default:
      return (
        <SettingsRow
          icon={<RefreshCw size={16} />}
          label="Check for updates"
          value={current}
          onClick={() => void check()}
        />
      )
  }
}
