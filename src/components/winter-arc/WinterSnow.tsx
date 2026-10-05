import type { CSSProperties } from 'react'
import { Snowflake } from 'lucide-react'

/**
 * Fixed values so the snowfall looks the same on every render. Negative delays
 * start each flake part-way through its fall, so the sky is never empty.
 * `top` is the resting position used when reduced motion is on.
 */
const FLAKE_COUNT = 26
const SIZES = [5, 7, 9, 6, 11, 8, 5, 10, 6, 13]

const FLAKES = Array.from({ length: FLAKE_COUNT }, (_, i) => {
  // Golden-ratio steps spread flakes evenly without visible rows or columns.
  const spread = (i * 0.618034) % 1
  const duration = 6 + ((i * 7) % 8)
  return {
    left: `${(2 + spread * 96).toFixed(1)}%`,
    top: `${((i * 37) % 100).toFixed(0)}%`,
    size: SIZES[i % SIZES.length],
    opacity: 0.2 + ((i * 3) % 5) * 0.06,
    duration,
    delay: -((i * 1.3) % duration),
    drift: (i % 2 === 0 ? 1 : -1) * (6 + ((i * 5) % 12)),
  }
})

/** Animated snowfall for Winter Arc surfaces. The parent must be `relative overflow-hidden`. */
export default function WinterSnow() {
  return (
    <>
      {FLAKES.map((flake, index) => (
        <Snowflake
          key={index}
          aria-hidden
          className="winter-snow-flake pointer-events-none absolute text-sky-100"
          style={
            {
              left: flake.left,
              top: flake.top,
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              '--snow-drift': `${flake.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </>
  )
}
