import { useEffect } from 'react'

export const REST_DURATION_SECONDS = 120
const WARNING_THRESHOLD_SECONDS = 10

type Props = {
  secondsLeft: number
  totalSeconds?: number
  onSkip: () => void
  onReset?: () => void
}

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function RestTimerOverlay({
  secondsLeft,
  totalSeconds = REST_DURATION_SECONDS,
  onSkip,
  onReset,
}: Props) {
  const isEnding = secondsLeft <= WARNING_THRESHOLD_SECONDS
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds))

  // Ring geometry
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  // Lock page scroll while the overlay is up
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  // Escape key skips the rest
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onSkip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSkip])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rest timer"
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black text-white"
      style={{
        paddingTop: 'var(--sat)',
        paddingBottom: 'var(--sab)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Rest</p>

      <div className="relative mt-6 flex items-center justify-center">
        <svg width={280} height={280} viewBox="0 0 280 280" className="-rotate-90">
          <circle
            cx={140}
            cy={140}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={10}
          />
          <circle
            cx={140}
            cy={140}
            r={radius}
            fill="none"
            stroke={isEnding ? '#ef4444' : '#ffffff'}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 300ms ease' }}
          />
        </svg>
        <span
          className={[
            'absolute text-7xl font-bold tabular-nums tracking-tight transition-colors duration-300',
            isEnding ? 'animate-pulse text-red-500' : 'text-white',
          ].join(' ')}
          aria-live="polite"
        >
          {formatClock(secondsLeft)}
        </span>
      </div>

      <p className="mt-6 text-sm text-white/60">
        {isEnding ? 'Get ready for the next set' : 'Next set starts when the timer ends'}
      </p>

      <div className="mt-10 flex items-center gap-4">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-5 py-3 text-sm font-medium text-white/60 transition hover:text-white"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-white/90 active:scale-95"
        >
          Skip rest
        </button>
      </div>
    </div>
  )
}
