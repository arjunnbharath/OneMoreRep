import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmSheetProps {
  open: boolean
  title: string
  message?: string
  icon?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export default function ConfirmSheet({
  open,
  title,
  message,
  icon,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), 280)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className={[
          'absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        className={[
          'relative w-full max-w-md rounded-t-[1.75rem] bg-surface px-6 pb-[max(1.25rem,var(--sab))] pt-3 text-center shadow-2xl ring-1 ring-border transition duration-300 ease-out sm:rounded-[1.75rem] sm:pb-6 sm:pt-6',
          visible ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-full opacity-0 sm:translate-y-0 sm:scale-95',
        ].join(' ')}
      >
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-foreground/15 sm:hidden" />
        {icon && (
          <div
            className={[
              'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
              destructive ? 'bg-red-500/10 text-red-500' : 'bg-foreground/[0.07] text-foreground',
            ].join(' ')}
          >
            {icon}
          </div>
        )}
        <h2 id="confirm-sheet-title" className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {message && <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{message}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className={[
              'h-12 rounded-full text-[15px] font-semibold transition active:scale-[0.98]',
              destructive ? 'bg-red-500 text-white' : 'bg-foreground text-background',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-full bg-foreground/[0.07] text-[15px] font-medium transition active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
