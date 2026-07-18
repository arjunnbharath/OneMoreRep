import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { Dumbbell } from 'lucide-react'
import { WEEKDAY_LABELS } from '../../lib/workoutPlan'
import type { Weekday } from '../../types/workoutPlan'

const SWIPE_ACTION_WIDTH = 112
const SWIPE_START_THRESHOLD = 72
const SWIPE_HINT_PEEK = SWIPE_ACTION_WIDTH
const SWIPE_HINT_CYCLES = 2
const SWIPE_HINT_SLIDE_MS = 1000
const SWIPE_HINT_HOLD_MS = 1000
const SWIPE_HINT_BETWEEN_MS = 400
const SWIPE_HINT_TRANSITION = `transform ${SWIPE_HINT_SLIDE_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1)`
export const SWIPE_HINT_TOTAL_MS =
  350 +
  SWIPE_HINT_CYCLES * (SWIPE_HINT_SLIDE_MS + SWIPE_HINT_HOLD_MS + SWIPE_HINT_SLIDE_MS) +
  (SWIPE_HINT_CYCLES - 1) * SWIPE_HINT_BETWEEN_MS

interface SwipeablePlanDayCardProps {
  day: Weekday
  canStart: boolean
  isToday?: boolean
  playHint?: boolean
  onSelect: () => void
  onStart: () => void
  as?: ElementType
  className?: string
  children: ReactNode
}

export default function SwipeablePlanDayCard({
  day,
  canStart,
  isToday = false,
  playHint = false,
  onSelect,
  onStart,
  as: Tag = 'div',
  className = '',
  children,
}: SwipeablePlanDayCardProps) {
  const frontRef = useRef<HTMLDivElement>(null)
  const onStartRef = useRef(onStart)
  const onSelectRef = useRef(onSelect)
  const canStartRef = useRef(canStart)
  onStartRef.current = onStart
  onSelectRef.current = onSelect
  canStartRef.current = canStart
  const [offsetX, setOffsetX] = useState(0)
  const [hintOffset, setHintOffset] = useState(0)
  const [isHinting, setIsHinting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const skipTapRef = useRef(false)
  const offsetRef = useRef(0)
  offsetRef.current = offsetX
  const displayOffset = dragging ? offsetX : Math.max(offsetX, hintOffset)

  const setSlideOffset = (value: number) => {
    const next = Math.max(0, Math.min(SWIPE_ACTION_WIDTH, value))
    offsetRef.current = next
    setOffsetX(next)
  }

  useEffect(() => {
    if (!playHint) {
      setHintOffset(0)
      setIsHinting(false)
      return
    }

    let cancelled = false
    const timeouts: number[] = []

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          if (!cancelled) resolve()
        }, ms)
        timeouts.push(id)
      })

    const run = async () => {
      setIsHinting(true)
      await wait(350)
      for (let cycle = 0; cycle < SWIPE_HINT_CYCLES && !cancelled; cycle++) {
        setHintOffset(SWIPE_HINT_PEEK)
        await wait(SWIPE_HINT_SLIDE_MS + SWIPE_HINT_HOLD_MS)
        if (cancelled) break
        setHintOffset(0)
        await wait(SWIPE_HINT_SLIDE_MS)
        if (cancelled) break
        if (cycle < SWIPE_HINT_CYCLES - 1) await wait(SWIPE_HINT_BETWEEN_MS)
      }
      if (!cancelled) setIsHinting(false)
    }

    void run()

    return () => {
      cancelled = true
      timeouts.forEach((id) => window.clearTimeout(id))
      setHintOffset(0)
      setIsHinting(false)
    }
  }, [playHint])

  useEffect(() => {
    const el = frontRef.current
    if (!el) return

    let startX = 0
    let startY = 0
    let startOffset = 0
    let lock: 'x' | 'y' | null = null
    let movedHorizontally = false

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startOffset = offsetRef.current
      lock = null
      movedHorizontally = false
      skipTapRef.current = false
      setHintOffset(0)
      setIsHinting(false)
      setDragging(true)
    }

    function onTouchMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY

      if (!lock) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        }
      }

      if (lock !== 'x') return

      const next = Math.max(0, Math.min(SWIPE_ACTION_WIDTH, startOffset + dx))
      if (next === startOffset && dx <= 0 && startOffset === 0) return

      e.preventDefault()
      movedHorizontally = Math.abs(dx) > 10
      setSlideOffset(next)
    }

    function onTouchEnd() {
      setDragging(false)
      const current = offsetRef.current

      if (current >= SWIPE_START_THRESHOLD) {
        skipTapRef.current = true
        if (canStartRef.current) {
          onStartRef.current()
        } else {
          onSelectRef.current()
        }
        setSlideOffset(0)
      } else if (current >= SWIPE_ACTION_WIDTH * 0.45) {
        setSlideOffset(SWIPE_ACTION_WIDTH)
      } else {
        setSlideOffset(0)
      }

      if (movedHorizontally) {
        skipTapRef.current = true
        window.setTimeout(() => {
          skipTapRef.current = false
        }, 300)
      }
    }

    const opts = { capture: true } as const
    el.addEventListener('touchstart', onTouchStart, { ...opts, passive: true })
    el.addEventListener('touchmove', onTouchMove, { ...opts, passive: false })
    el.addEventListener('touchend', onTouchEnd, opts)
    el.addEventListener('touchcancel', onTouchEnd, opts)

    return () => {
      el.removeEventListener('touchstart', onTouchStart, opts)
      el.removeEventListener('touchmove', onTouchMove, opts)
      el.removeEventListener('touchend', onTouchEnd, opts)
      el.removeEventListener('touchcancel', onTouchEnd, opts)
    }
  }, [])

  function handleSelect() {
    if (skipTapRef.current) return
    if (offsetRef.current > 0) {
      setSlideOffset(0)
      return
    }
    onSelect()
  }

  function handleAction() {
    setSlideOffset(0)
    if (canStart) {
      onStart()
    } else {
      onSelect()
    }
  }

  return (
    <Tag className={`overflow-hidden rounded-2xl ${className}`.trim()}>
      <div className="relative min-h-[5.5rem] overflow-hidden rounded-2xl bg-black">
        {displayOffset > 0 && (
          <div
            className="absolute inset-y-0 left-0 z-0 flex h-full items-stretch rounded-2xl bg-foreground"
            style={{ width: SWIPE_ACTION_WIDTH }}
          >
            <button
              type="button"
              onClick={handleAction}
              className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-transparent px-2 text-background"
              aria-label={
                canStart
                  ? `Start ${WEEKDAY_LABELS[day]} workout`
                  : `Plan ${WEEKDAY_LABELS[day]}`
              }
            >
              <Dumbbell size={20} className="plan-swipe-gym-icon" strokeWidth={2.25} />
              <span className="text-[11px] font-semibold">{canStart ? 'Start' : 'Plan'}</span>
            </button>
          </div>
        )}

        <div
          ref={frontRef}
          className="relative z-10 min-h-[5.5rem] w-full overflow-hidden rounded-2xl bg-black touch-pan-y will-change-transform"
          style={{
            transform: `translateX(${displayOffset}px)`,
            transition: dragging ? 'none' : isHinting ? SWIPE_HINT_TRANSITION : 'transform 0.22s ease-out',
          }}
        >
          <button
            type="button"
            onClick={handleSelect}
            className={[
              'group relative min-h-[5.5rem] h-full w-full overflow-hidden rounded-2xl bg-black text-left transition active:scale-[0.99]',
              isToday ? 'ring-2 ring-inset ring-white/90' : '',
            ].join(' ')}
          >
            {children}
          </button>
        </div>
      </div>
    </Tag>
  )
}
