import { STAT_MUSCLE_LABELS, type StatMuscle } from '../../../lib/statsInsights'

type Tone = 'green' | 'amber' | 'blue'

const TONES: Record<Tone, { low: [number, number, number]; high: [number, number, number] }> = {
  green: { low: [22, 101, 52], high: [74, 222, 128] },
  amber: { low: [146, 64, 14], high: [251, 191, 36] },
  blue: { low: [30, 64, 175], high: [96, 165, 250] },
}

const UNTRAINED = '#3a3a40'
const SILHOUETTE = '#232327'
const SEAM = '#141416'

function muscleColor(tone: Tone, amount: number) {
  if (amount <= 0) return UNTRAINED
  const t = Math.min(1, 0.25 + amount * 0.75)
  const { low, high } = TONES[tone]
  const mix = low.map((value, index) => Math.round(value + (high[index] - value) * t))
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`
}

type Shape = { muscle: StatMuscle; d: string }

/** Left half of the body (viewer's left). The right half is mirrored. */
const BODY_HALF =
  'M100 56 L90 58 C80 62 66 66 56 72 C46 78 42 92 44 104 C40 120 38 140 40 152 C34 170 30 190 30 206 C30 216 36 222 42 216 L46 208 C52 190 57 172 61 156 L63 150 C65 160 65 172 67 184 C60 212 58 252 64 284 C62 302 62 332 70 366 C70 376 75 382 83 380 C89 378 91 368 89 354 C93 332 95 308 93 290 C97 264 98 238 98 212 L100 208 Z'

const FRONT_SHAPES: Shape[] = [
  { muscle: 'shoulders', d: 'M74 72 C62 70 51 78 48 92 C46 103 51 110 58 106 C62 97 68 89 78 82 Z' },
  { muscle: 'chest', d: 'M98 78 L98 118 C86 123 72 119 66 108 C63 98 67 86 76 80 C84 76 92 76 98 78 Z' },
  { muscle: 'biceps', d: 'M50 108 C44 120 42 134 45 146 C49 151 56 149 58 141 C60 129 60 117 58 107 Z' },
  { muscle: 'forearms', d: 'M44 154 C38 168 34 186 33 202 C35 209 41 210 44 204 C48 188 54 172 57 156 Z' },
  { muscle: 'obliques', d: 'M70 124 C66 140 68 160 76 178 L84 182 L84 126 C80 122 74 121 70 124 Z' },
  { muscle: 'abs', d: 'M87 124 L97 124 L97 136 L87 136 Z' },
  { muscle: 'abs', d: 'M87 140 L97 140 L97 152 L87 152 Z' },
  { muscle: 'abs', d: 'M87 156 L97 156 L97 168 L87 168 Z' },
  { muscle: 'abs', d: 'M87 172 L97 172 L97 190 C93 192 89 190 87 186 Z' },
  { muscle: 'hipFlexors', d: 'M78 186 C85 192 92 198 98 204 L98 196 C92 190 85 186 78 186 Z' },
  { muscle: 'quads', d: 'M70 198 C62 222 62 252 68 278 C74 290 85 290 89 278 C93 256 93 228 87 206 C83 199 76 195 70 198 Z' },
  { muscle: 'adductors', d: 'M90 208 C96 222 98 240 96 260 C93 254 91 238 89 220 Z' },
  { muscle: 'shins', d: 'M72 302 C70 322 72 346 76 364 L81 364 C81 344 79 322 77 302 Z' },
  { muscle: 'calves', d: 'M84 300 C90 316 90 340 86 360 L82 360 C84 340 84 318 81 302 Z' },
]

const BACK_SHAPES: Shape[] = [
  { muscle: 'upperBack', d: 'M98 60 L98 120 C88 112 81 97 77 83 C83 74 90 66 98 60 Z' },
  { muscle: 'shoulders', d: 'M74 72 C62 70 51 78 48 92 C46 103 51 110 58 106 C62 97 68 89 78 82 Z' },
  { muscle: 'upperBack', d: 'M75 97 C70 116 72 140 82 160 L98 168 L98 125 C88 119 80 109 75 97 Z' },
  { muscle: 'triceps', d: 'M50 108 C44 120 42 134 45 148 C51 151 57 145 59 133 C60 121 58 112 56 106 Z' },
  { muscle: 'forearms', d: 'M44 154 C38 168 34 186 33 202 C35 209 41 210 44 204 C48 188 54 172 57 156 Z' },
  { muscle: 'lowerBack', d: 'M81 162 L98 170 L98 192 C90 188 84 178 81 162 Z' },
  { muscle: 'glutes', d: 'M76 194 C66 202 66 222 74 232 C84 238 95 234 98 226 L98 198 C90 192 82 190 76 194 Z' },
  { muscle: 'hamstrings', d: 'M70 240 C64 258 66 278 72 290 C78 296 88 294 90 284 C94 266 94 252 90 240 C84 237 76 237 70 240 Z' },
  { muscle: 'calves', d: 'M70 302 C64 318 66 338 74 352 C80 356 86 352 88 342 C90 326 88 312 84 302 Z' },
]

interface MuscleFigureProps {
  side: 'front' | 'back'
  intensity: Partial<Record<StatMuscle, number>>
  tone?: Tone
}

export default function MuscleFigure({ side, intensity, tone = 'green' }: MuscleFigureProps) {
  const shapes = side === 'front' ? FRONT_SHAPES : BACK_SHAPES
  const glowId = `muscle-glow-${side}-${tone}`

  const renderHalf = (mirrored: boolean) => (
    <g transform={mirrored ? 'translate(200 0) scale(-1 1)' : undefined}>
      <path d={BODY_HALF} fill={SILHOUETTE} />
      {shapes.map((shape, index) => {
        const amount = intensity[shape.muscle] ?? 0
        const trained = amount > 0
        return (
          <path
            key={`${shape.muscle}-${index}`}
            d={shape.d}
            fill={muscleColor(tone, amount)}
            stroke={SEAM}
            strokeWidth={1.2}
            strokeLinejoin="round"
            filter={trained && amount > 0.5 ? `url(#${glowId})` : undefined}
          >
            <title>{STAT_MUSCLE_LABELS[shape.muscle]}</title>
          </path>
        )
      })}
    </g>
  )

  return (
    <svg viewBox="0 0 200 392" className="h-64 w-full" role="img" aria-label={`${side} body`}>
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="100" cy="34" rx="19" ry="23" fill={SILHOUETTE} />
      <path d="M90 52 L110 52 L112 64 L88 64 Z" fill={SILHOUETTE} />

      {renderHalf(false)}
      {renderHalf(true)}
    </svg>
  )
}
