import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
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
  stepIndex: number
  onStepIndexChange: (index: number | ((current: number) => number)) => void
  onComplete: () => void
  onSkip: () => void
}

const SPOTLIGHT_PADDING = 10

function findVisibleElement(selector: string): Element | null {
  const elements = document.querySelectorAll(selector)
  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return element
    }
  }
  return null
}

function isFixedOrSticky(element: Element) {
  const style = window.getComputedStyle(element)
  return style.position === 'fixed' || style.position === 'sticky'
}

function rectsEqual(a: Rect | null, b: Rect | null) {
  if (!a || !b) return a === b
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5 &&
    Math.abs(a.radius - b.radius) < 0.5
  )
}

function getTourBottomInset(activeSelector?: string | null) {
  if (activeSelector?.includes('main-nav-mobile')) {
    return 16
  }

  const mobileNav = document.querySelector('[data-tour="main-nav-mobile"]')
  if (mobileNav) {
    const rect = mobileNav.getBoundingClientRect()
    if (rect.height > 0 && rect.top < window.innerHeight) {
      return window.innerHeight - rect.top + 12
    }
  }

  const mobileNavHeight = getComputedStyle(document.documentElement)
    .getPropertyValue('--mobile-nav-height')
    .trim()
  const parsed = Number.parseFloat(mobileNavHeight)
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed + 12
  }

  return 88
}

function scrollTargetIntoView(
  element: Element,
  behavior: ScrollBehavior = 'smooth',
  activeSelector?: string | null,
) {
  if (isFixedOrSticky(element)) return

  const topMargin = 16
  const bottomLimit = window.innerHeight - getTourBottomInset(activeSelector)
  const rect = element.getBoundingClientRect()

  if (rect.bottom > bottomLimit) {
    scrollByDelta(element, rect.bottom - bottomLimit, behavior)
  } else if (rect.top < topMargin) {
    scrollByDelta(element, rect.top - topMargin, behavior)
  }
}

function scrollByDelta(element: Element, delta: number, behavior: ScrollBehavior = 'smooth') {
  if (Math.abs(delta) < 1) return

  let node: Element | null = element
  while (node) {
    const parent: HTMLElement | null = node.parentElement
    if (!parent) break

    const style = getComputedStyle(parent)
    const canScroll = parent.scrollHeight > parent.clientHeight + 1
    if (
      canScroll &&
      (style.overflowY === 'auto' ||
        style.overflowY === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll')
    ) {
      parent.scrollBy({ top: delta, behavior })
      return
    }
    node = parent
  }

  window.scrollBy({ top: delta, behavior })
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function measureTarget(selector: string): Rect | null {
  const element = findVisibleElement(selector)
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

function isInViewport(rect: Rect, activeSelector?: string | null) {
  const margin = 16
  const bottomLimit = window.innerHeight - getTourBottomInset(activeSelector)
  return (
    rect.top >= margin &&
    rect.left >= margin &&
    rect.top + rect.height <= bottomLimit
  )
}

function getTooltipPosition(
  rect: Rect | null,
  placement: TourPlacement,
  gap = 24,
  activeSelector?: string | null,
): { top: number; left: number; width: number } {
  const margin = 16
  const tooltipWidth = Math.min(340, window.innerWidth - margin * 2)
  const bottomLimit = window.innerHeight - getTourBottomInset(activeSelector)

  if (!rect || placement === 'center') {
    return {
      top: Math.max(margin, window.innerHeight / 2 - 130),
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
      top: Math.min(rect.top + rect.height + gap, bottomLimit - 200),
      left: centeredLeft,
      width: tooltipWidth,
    }
  }

  if (placement === 'top') {
    return {
      top: Math.max(margin, rect.top - 200 - gap),
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

export default function AppTour({
  open,
  steps,
  stepIndex,
  onStepIndexChange,
  onComplete,
  onSkip,
}: AppTourProps) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [ready, setReady] = useState(false)
  const [measuring, setMeasuring] = useState(false)
  const measuringRef = useRef(false)
  const activeSelectorRef = useRef<string | null>(null)
  const resolveSelectorRef = useRef<(() => string | undefined) | null>(null)
  const updateGenerationRef = useRef(0)

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex >= steps.length - 1
  const placement = step?.placement ?? (step?.target ? 'bottom' : 'center')
  const tooltipGap = step?.tooltipGap ?? 24
  const progress = ((stepIndex + 1) / steps.length) * 100

  const updateRect = useCallback(async () => {
    if (!open || !step) return

    const generation = updateGenerationRef.current + 1
    updateGenerationRef.current = generation
    const isStale = () => updateGenerationRef.current !== generation

    measuringRef.current = true
    setMeasuring(true)
    if (step.onEnter) await step.onEnter()
    if (isStale()) return

    resolveSelectorRef.current = () => step.getTarget?.() ?? step.target

    await waitForNextFrame()
    await waitForNextFrame()
    if (isStale()) return

    let selector: string | undefined
    let element: Element | null = null

    for (let attempt = 0; attempt < 24; attempt++) {
      if (isStale()) return

      selector = resolveSelectorRef.current()
      activeSelectorRef.current = selector ?? null
      if (!selector) break

      element = findVisibleElement(selector)
      const measured = measureTarget(selector)
      if (element && measured) break

      await wait(attempt < 4 ? 50 : 80)
    }

    if (isStale()) return

    if (selector && element) {
      const initial = measureTarget(selector)
      if (initial && !isInViewport(initial, selector) && !isFixedOrSticky(element)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
        scrollTargetIntoView(element, 'smooth', selector)
        await wait(320)
        await waitForNextFrame()
        if (isStale()) return
      } else if (!isFixedOrSticky(element)) {
        scrollTargetIntoView(element, 'auto', selector)
        await waitForNextFrame()
        if (isStale()) return
      }

      const nextRect = measureTarget(selector)
      setRect((current) => (rectsEqual(current, nextRect) ? current : nextRect))
    } else {
      activeSelectorRef.current = null
      setRect(null)
    }

    setReady(true)
    setMeasuring(false)
    measuringRef.current = false
  }, [open, step])

  useEffect(() => {
    if (!open) {
      updateGenerationRef.current += 1
      setRect(null)
      setReady(false)
      setMeasuring(false)
      activeSelectorRef.current = null
      return
    }
    void updateRect()
  }, [open, stepIndex, updateRect])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open) return

    let frame = 0

    function remeasureTarget() {
      if (measuringRef.current) return
      const selector = resolveSelectorRef.current?.() ?? activeSelectorRef.current
      if (!selector) return

      activeSelectorRef.current = selector
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (measuringRef.current) return
        const nextRect = measureTarget(selector)
        setRect((current) => (rectsEqual(current, nextRect) ? current : nextRect))
      })
    }

    window.addEventListener('resize', remeasureTarget)
    window.addEventListener('scroll', remeasureTarget, true)

    const selector = resolveSelectorRef.current?.() ?? activeSelectorRef.current
    const element = selector ? findVisibleElement(selector) : null
    let observer: ResizeObserver | null = null
    if (element && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => remeasureTarget())
      observer.observe(element)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', remeasureTarget)
      window.removeEventListener('scroll', remeasureTarget, true)
      observer?.disconnect()
    }
  }, [open, stepIndex, ready])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onSkip()
        return
      }
      if (event.key === 'ArrowRight' && !isLast) {
        onStepIndexChange((index) => index + 1)
      }
      if (event.key === 'ArrowLeft' && !isFirst) {
        onStepIndexChange((index) => index - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isFirst, isLast, onSkip, onStepIndexChange])

  if (!open || !step) return null

  const tooltip = getTooltipPosition(rect, placement, tooltipGap, activeSelectorRef.current)
  const isCenter = placement === 'center' || !rect

  function handleNext() {
    if (isLast) {
      onComplete()
      return
    }
    onStepIndexChange((index) => index + 1)
  }

  function handleBack() {
    if (!isFirst) onStepIndexChange((index) => index - 1)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] pointer-events-auto touch-none"
      role="dialog"
      aria-modal="true"
      aria-label="App tour"
    >
      {rect ? (
        <div
          className="pointer-events-auto fixed transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top,left,width,height]"
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
        <div className="absolute inset-0 bg-black/72 transition-opacity duration-300" />
      )}

      <div
        className={[
          'fixed z-[201] touch-auto overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border transition-[opacity,transform] duration-300 ease-out pointer-events-auto',
          ready ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          measuring && ready ? 'scale-[0.99] opacity-90' : '',
        ].join(' ')}
        style={{
          top: tooltip.top,
          left: tooltip.left,
          width: tooltip.width,
        }}
      >
        <div className="h-1 bg-border/50">
          <div
            className="h-full bg-foreground/80 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isCenter && step.id === 'welcome' && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                    <Sparkles size={14} />
                  </span>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  {stepIndex + 1} / {steps.length}
                </p>
              </div>
              <h3 className="mt-1.5 text-lg font-bold tracking-tight">{step.title}</h3>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-background hover:text-foreground"
              aria-label="Skip tour"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isFirst ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-muted ring-1 ring-border transition hover:bg-background hover:text-foreground"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Skip
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {isLast ? 'Get started' : 'Next'}
              {!isLast && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
