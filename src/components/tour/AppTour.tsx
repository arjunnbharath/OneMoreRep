import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, X } from 'lucide-react'
import type { TourPlacement, TourStep } from '../../lib/tourTypes'

interface Rect {
  top: number
  left: number
  width: number
  height: number
  radius: number
}

interface AppTourProps {
  open: boolean
  steps: TourStep[]
  onStepChange?: (stepId: string | null) => void
  onComplete: () => void
  onSkip: () => void
}

const SPOTLIGHT_PADDING = 10

function measureTarget(selector: string): Rect | null {
  const element = document.querySelector(selector)
  if (!element) return null

  const box = element.getBoundingClientRect()
  if (box.width <= 0 || box.height <= 0) return null
  const styles = window.getComputedStyle(element)
  const radius = Number.parseFloat(styles.borderRadius) || 16

  return {
    top: box.top - SPOTLIGHT_PADDING,
    left: box.left - SPOTLIGHT_PADDING,
    width: box.width + SPOTLIGHT_PADDING * 2,
    height: box.height + SPOTLIGHT_PADDING * 2,
    radius: Math.min(radius + 4, 24),
  }
}

function getTooltipPosition(
  rect: Rect | null,
  placement: TourPlacement,
  gap = 24,
): { top: number; left: number; width: number } {
  const margin = 16
  const tooltipWidth = Math.min(320, window.innerWidth - margin * 2)

  if (!rect || placement === 'center') {
    return {
      top: Math.max(margin, window.innerHeight / 2 - 120),
      left: (window.innerWidth - tooltipWidth) / 2,
      width: tooltipWidth,
    }
  }

  const centeredLeft = Math.max(
    margin,
    Math.min(rect.left + (rect.width - tooltipWidth) / 2, window.innerWidth - tooltipWidth - margin),
  )

  if (placement === 'bottom') {
    return {
      top: Math.min(rect.top + rect.height + gap, window.innerHeight - 200),
      left: centeredLeft,
      width: tooltipWidth,
    }
  }

  if (placement === 'top') {
    return {
      top: Math.max(margin, rect.top - 190 - gap),
      left: centeredLeft,
      width: tooltipWidth,
    }
  }

  return {
    top: Math.max(margin, rect.top),
    left: Math.max(margin, Math.min(rect.left + rect.width + gap, window.innerWidth - tooltipWidth - margin)),
    width: tooltipWidth,
  }
}

export default function AppTour({ open, steps, onStepChange, onComplete, onSkip }: AppTourProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [ready, setReady] = useState(false)

  const step = steps[stepIndex]
  const isLast = stepIndex >= steps.length - 1
  const placement = step?.placement ?? (step?.target ? 'bottom' : 'center')
  const tooltipGap = step?.tooltipGap ?? 24

  const updateRect = useCallback(async () => {
    if (!open || !step) return

    setReady(false)
    onStepChange?.(step.id)
    if (step.onEnter) await step.onEnter()

    const selector = step.getTarget?.() ?? step.target

    if (selector) {
      let element: Element | null = null
      for (let attempt = 0; attempt < 12; attempt++) {
        element = document.querySelector(selector)
        if (element) break
        await new Promise((resolve) => window.setTimeout(resolve, 80))
      }

      element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      await new Promise((resolve) => window.setTimeout(resolve, 450))
      setRect(measureTarget(selector))
    } else {
      setRect(null)
    }

    setReady(true)
  }, [open, step, onStepChange])

  useEffect(() => {
    if (!open) {
      setStepIndex(0)
      setRect(null)
      setReady(false)
      onStepChange?.(null)
      return
    }
    void updateRect()
  }, [open, stepIndex, updateRect, onStepChange])

  useLayoutEffect(() => {
    if (!open || !step) return
    const selector = step.getTarget?.() ?? step.target
    if (!selector) return

    const sel = selector

    function handleLayoutChange() {
      setRect(measureTarget(sel))
    }

    window.addEventListener('resize', handleLayoutChange)
    window.addEventListener('scroll', handleLayoutChange, true)
    return () => {
      window.removeEventListener('resize', handleLayoutChange)
      window.removeEventListener('scroll', handleLayoutChange, true)
    }
  }, [open, step])

  if (!open || !step) return null

  const tooltip = getTooltipPosition(rect, placement, tooltipGap)

  function handleNext() {
    if (isLast) {
      onComplete()
      return
    }
    setStepIndex((index) => index + 1)
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-auto" role="dialog" aria-modal="true" aria-label="App tour">
      {rect ? (
        <div
          className="pointer-events-none fixed transition-all duration-300 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: rect.radius,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/72" />
      )}

      <div
        className={[
          'fixed z-[201] rounded-2xl bg-surface p-5 shadow-2xl ring-1 ring-border transition-opacity duration-200 pointer-events-auto',
          ready ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          top: tooltip.top,
          left: tooltip.left,
          width: tooltip.width,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-tight">{step.title}</h3>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 rounded-lg p-1 text-muted transition hover:bg-background hover:text-foreground"
            aria-label="Skip tour"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-muted transition hover:text-foreground"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {isLast ? 'Done' : 'Next'}
            {!isLast && <ChevronRight size={15} />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
