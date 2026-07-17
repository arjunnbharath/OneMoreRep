import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Download, Eraser, FileSpreadsheet, FileText } from 'lucide-react'
import Button from '../Button'
import { exportUserData } from '../../lib/exportUserData'
import type { FoodLogEntry, UserNutritionProfile } from '../../types/nutrition'
import type { WorkoutSession } from '../../types/tracker'
import type { WeeklyPlan } from '../../types/workoutPlan'

interface DataSettingsProps {
  userName?: string
  sessions: WorkoutSession[]
  plan: WeeklyPlan
  nutritionProfile: UserNutritionProfile | null
  foodLogs: FoodLogEntry[]
  onBack: () => void
  onClearAllData: () => Promise<void>
}

export default function DataSettings({
  userName,
  sessions,
  plan,
  nutritionProfile,
  foodLogs,
  onBack,
  onClearAllData,
}: DataSettingsProps) {
  const [showExport, setShowExport] = useState(false)
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel')
  const [includeWorkout, setIncludeWorkout] = useState(true)
  const [includeCalories, setIncludeCalories] = useState(true)
  const [exportError, setExportError] = useState('')
  const [exporting, setExporting] = useState(false)

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearError, setClearError] = useState('')
  const [clearing, setClearing] = useState(false)

  async function handleExport() {
    setExportError('')

    if (!includeWorkout && !includeCalories) {
      setExportError('Select at least one data type')
      return
    }

    setExporting(true)
    try {
      await exportUserData({
        format,
        includeWorkout,
        includeCalories,
        userName,
        sessions,
        plan,
        nutritionProfile,
        foodLogs,
      })
      setShowExport(false)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  async function handleClearAllData() {
    setClearError('')
    setClearing(true)
    try {
      await onClearAllData()
    } catch (err) {
      setClearError(err instanceof Error ? err.message : 'Failed to clear data')
      setClearing(false)
    }
  }

  function handleBack() {
    if (showExport) {
      setShowExport(false)
      setExportError('')
      return
    }
    if (showClearConfirm) {
      setShowClearConfirm(false)
      setClearError('')
      return
    }
    onBack()
  }

  return (
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 px-5 py-4 lg:border-b lg:border-border lg:px-10 lg:py-6">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
            Settings
          </p>
          <h1 className="text-lg font-semibold lg:text-2xl lg:tracking-tight">Data</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-5 pb-8 lg:max-w-none lg:px-10 lg:pb-10">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Export
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            <button
              type="button"
              onClick={() => {
                setExportError('')
                setShowExport(true)
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
                <Download size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Export data</span>
                <span className="block text-xs text-muted">
                  Download workouts and calories as Excel or PDF
                </span>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Manage
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Eraser size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Clear all data</span>
                  <span className="block text-xs text-muted">
                    Erase workouts, plans, calories & bookmarks
                  </span>
                </div>
              </button>
            ) : (
              <div className="bg-amber-50/80 p-4 dark:bg-amber-950/20">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Clear all app data?
                </p>
                <p className="mt-1 text-xs text-muted">
                  Your name, email, and password will stay. Everything else is removed from the
                  database.
                </p>
                {clearError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{clearError}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={clearing}
                    className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllData}
                    disabled={clearing}
                    className="flex-1 rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {clearing ? 'Clearing…' : 'Clear data'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {showExport &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 pb-[max(1rem,var(--mobile-nav-height))] sm:items-center sm:pb-4">
            <div
              className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-xl ring-1 ring-border"
              role="dialog"
              aria-modal="true"
              aria-labelledby="export-data-title"
            >
            <h2 id="export-data-title" className="text-lg font-semibold">
              Export data
            </h2>
            <p className="mt-1 text-sm text-muted">Choose a format and what to include.</p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Format
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'excel' as const, label: 'Excel', icon: FileSpreadsheet },
                    { id: 'pdf' as const, label: 'PDF', icon: FileText },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormat(id)}
                    className={[
                      'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition ring-1',
                      format === id
                        ? 'bg-foreground text-background ring-foreground'
                        : 'bg-background text-foreground ring-border',
                    ].join(' ')}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Include
              </p>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-background px-4 py-3 ring-1 ring-border">
                  <input
                    type="checkbox"
                    checked={includeWorkout}
                    onChange={(e) => setIncludeWorkout(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-medium">Workout data</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-background px-4 py-3 ring-1 ring-border">
                  <input
                    type="checkbox"
                    checked={includeCalories}
                    onChange={(e) => setIncludeCalories(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-medium">Calories data</span>
                </label>
              </div>
            </div>

            {exportError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{exportError}</p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowExport(false)}
                disabled={exporting}
                className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
              >
                Cancel
              </button>
              <Button
                type="button"
                className="flex-1 py-2.5"
                disabled={exporting}
                onClick={handleExport}
              >
                {exporting ? 'Exporting…' : 'Export'}
              </Button>
            </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
