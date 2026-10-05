import { useEffect, useState, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
}

/** Partial-height sheet that slides up above the bottom nav, matching the Add Food sheet. */
export default function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), 380)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      <button
        type="button"
        aria-label={`Close ${label}`}
        onClick={onClose}
        className={[
          'absolute inset-0 bg-black/45 transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex justify-center"
        style={{ paddingBottom: 'var(--mobile-nav-height)' }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={[
            'add-food-sheet flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl ring-1 ring-border',
            visible ? 'add-food-sheet--open' : 'add-food-sheet--closed',
          ].join(' ')}
          style={{ height: 'min(90dvh, 720px)' }}
        >
          <div className="flex shrink-0 justify-center pb-1 pt-2.5">
            <span className="h-1 w-9 rounded-full bg-foreground/15" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  )
}
