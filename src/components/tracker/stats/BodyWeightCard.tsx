import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronRight, Plus, Target } from 'lucide-react'
import { useBodyWeight, type BodyWeightEntry } from '../../../hooks/useBodyWeight'
import { rangeStart, trimNumber, type WeightRange } from '../../../lib/statsInsights'
import { StatsCard, StatsPills } from './StatsChrome'

const RANGES: { id: WeightRange; label: string }[] = [
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '1y', label: '1Y' },
  { id: 'all', label: 'All' },
]

export default function BodyWeightCard() {
  const { entries, logWeight } = useBodyWeight()
  const [range, setRange] = useState<WeightRange>('3m')
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [kg, setKg] = useState('')

  const visible = useMemo(() => {
    const start = rangeStart(range)
    return entries.filter((entry) => !start || new Date(entry.date).getTime() >= start.getTime())
  }, [entries, range])

  const latest = entries[entries.length - 1]
  const chart = useMemo(() => buildWeightChart(visible), [visible])

  function handleLog(event: FormEvent) {
    event.preventDefault()
    const value = parseFloat(kg)
    if (!Number.isFinite(value) || value <= 0) return
    logWeight(value)
    setKg('')
    setOpen(false)
  }

  return (
    <StatsCard>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Body weight</h2>
        <div className="flex items-center gap-3">
          {latest && (
            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-300">
              <Target size={14} />
              {trimNumber(latest.kg)}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-1 text-sm font-semibold text-emerald-400"
          >
            <Plus size={14} />
            Log
          </button>
        </div>
      </div>

      {open && (
        <form onSubmit={handleLog} className="mt-3 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={1}
            step={0.1}
            required
            autoFocus
            value={kg}
            onChange={(event) => setKg(event.target.value)}
            placeholder="kg"
            className="no-spinner w-full rounded-xl bg-black/40 px-3 py-2.5 text-sm outline-none ring-1 ring-white/15 placeholder:text-zinc-500 focus:ring-emerald-400/60"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-black"
          >
            Save
          </button>
        </form>
      )}

      <div className="mt-4">
        <StatsPills value={range} options={RANGES} onChange={setRange} ariaLabel="Body weight period" />
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
No weigh-ins yet
        </p>
      ) : (
        <>
          {chart && (
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="mt-4 h-36 w-full">
              <defs>
                <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <line
                x1={chart.pad}
                x2={chart.width - chart.pad}
                y1={chart.lastY}
                y2={chart.lastY}
                stroke="#eab308"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <path d={chart.area} fill="url(#weight-fill)" />
              <path d={chart.line} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx={chart.lastX} cy={chart.lastY} r="4" fill="#4ade80" />
              <text
                x={chart.width - 4}
                y={chart.lastY - 8}
                textAnchor="end"
                fill="#4ade80"
                fontSize="12"
                fontWeight="600"
              >
                {trimNumber(visible[visible.length - 1].kg)}
              </text>
            </svg>
          )}

          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-2 flex w-full items-center justify-end gap-1 text-sm font-medium text-emerald-400"
          >
            All weigh-ins
            <ChevronRight size={14} className={showAll ? 'rotate-90' : ''} />
          </button>

          {showAll && (
            <ul className="mt-2 divide-y divide-white/10">
              {[...entries].reverse().map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-zinc-400">{formatWeighIn(entry)}</span>
                  <span className="font-medium tabular-nums">{trimNumber(entry.kg)} kg</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </StatsCard>
  )
}

function formatWeighIn(entry: BodyWeightEntry) {
  return new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildWeightChart(entries: BodyWeightEntry[]) {
  if (entries.length === 0) return null
  const width = 320
  const height = 140
  const pad = 16
  const values = entries.map((entry) => entry.kg)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  const coords = entries.map((entry, index) => ({
    x: pad + (entries.length === 1 ? innerW / 2 : (index / (entries.length - 1)) * innerW),
    y: pad + innerH - ((entry.kg - min) / span) * innerH,
  }))
  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${coords[coords.length - 1].x} ${height - pad} L ${coords[0].x} ${height - pad} Z`
  const last = coords[coords.length - 1]
  return { width, height, pad, line, area, lastX: last.x, lastY: last.y }
}
