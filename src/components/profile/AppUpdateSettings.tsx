import { useState } from 'react'
import { AlertCircle, CheckCircle2, Download, RefreshCw, Sparkles, X } from 'lucide-react'
import Button from '../Button'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { SettingsRow } from './SettingsUI'

/** Splits release notes ("a, b; c" or multi-line) into bullet points. */
function noteLines(notes?: string) {
  if (!notes) return []
  return notes
    .split(/\r?\n|;|•/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean)
}

/** "Check for updates" row; tapping opens a dialog that checks, confirms, and installs. */
export default function AppUpdateSettings() {
  const { supported, status, installed, latest, error, check, install } = useAppUpdate({
    checkOnMount: false,
  })
  const [open, setOpen] = useState(false)

  if (!supported) return null

  function openDialog() {
    setOpen(true)
    void check()
  }

  const currentVersion = installed ? `v${installed.versionName}` : undefined
  const busy = status === 'checking' || status === 'downloading'

  return (
    <>
      <SettingsRow
        icon={<RefreshCw size={16} />}
        label="Check for updates"
        value={currentVersion}
        onClick={openDialog}
      />

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 pb-[max(1rem,var(--mobile-nav-height))] sm:items-center sm:pb-4"
          role="dialog"
          aria-modal="true"
          aria-label="App updates"
        >
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">OneMoreRep</p>
                <h2 className="mt-1 text-xl font-bold">
                  {status === 'available' && 'Update available'}
                  {status === 'checking' && 'Checking for updates'}
                  {status === 'downloading' && 'Downloading update'}
                  {status === 'installing' && 'Ready to install'}
                  {status === 'permission-required' && 'One more step'}
                  {status === 'up-to-date' && "You're up to date"}
                  {status === 'unconfigured' && 'Updates not set up'}
                  {(status === 'error' || status === 'idle') && 'Check for updates'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                aria-label="Close"
                className="text-muted transition hover:text-foreground disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              {status === 'checking' && (
                <div className="flex items-center gap-3 text-sm text-muted">
                  <RefreshCw size={18} className="animate-spin" />
                  Looking for a newer version…
                </div>
              )}

              {status === 'available' && latest && (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 ring-1 ring-border">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                      <Sparkles size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Version {latest.versionName}</p>
                      <p className="text-xs text-muted">
                        {currentVersion ? `You have ${currentVersion}` : 'Newer than your version'}
                      </p>
                    </div>
                  </div>
                  {noteLines(latest.notes).length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {noteLines(latest.notes).map((line) => (
                        <li key={line} className="flex gap-2 text-sm">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {status === 'downloading' && (
                <div className="flex items-center gap-3 text-sm text-muted">
                  <RefreshCw size={18} className="animate-spin" />
                  Downloading {latest?.versionName ? `v${latest.versionName}` : 'update'}
                </div>
              )}

              {status === 'installing' && (
                <p className="text-sm text-muted">Confirm the install on the next screen.</p>
              )}

              {status === 'permission-required' && (
                <p className="text-sm text-muted">
                  Turn on <span className="font-medium text-foreground">Allow from this source</span>, then tap
                  Continue.
                </p>
              )}

              {status === 'up-to-date' && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                  <span>{currentVersion ? `${currentVersion} is current.` : 'You have the latest version.'}</span>
                </div>
              )}

              {status === 'unconfigured' && (
                <p className="text-sm text-muted">Updates aren't available in this build.</p>
              )}

              {status === 'error' && (
                <div className="flex items-start gap-3 text-sm">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
                  <span className="text-muted">{error ?? 'Could not check for updates.'}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              {status === 'available' && (
                <Button fullWidth className="py-3.5" onClick={() => void install()}>
                  <Download size={16} className="mr-2" />
                  Download &amp; install
                </Button>
              )}
              {status === 'installing' && (
                <Button fullWidth className="py-3.5" onClick={() => void install()}>
                  Open installer again
                </Button>
              )}
              {status === 'permission-required' && (
                <Button fullWidth className="py-3.5" onClick={() => void install()}>
                  Continue
                </Button>
              )}
              {status === 'error' && (
                <Button fullWidth className="py-3.5" onClick={() => void check()}>
                  Try again
                </Button>
              )}
              {!busy && (
                <Button fullWidth variant="outline" className="py-3.5" onClick={() => setOpen(false)}>
                  {status === 'available' ? 'Later' : 'Close'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
