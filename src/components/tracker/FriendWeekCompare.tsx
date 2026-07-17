interface WeekCompareData {
  myWorkouts: number
  friendWorkouts: number
  myVolume: number
  friendVolume: number
}

interface FriendWeekCompareProps {
  myLabel: string
  friendLabel: string
  data: WeekCompareData
}

function formatVolume(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
  return String(kg)
}

function SplitBar({ you, them }: { you: number; them: number }) {
  const total = you + them
  const youPct = total > 0 ? (you / total) * 100 : 50
  const themPct = total > 0 ? (them / total) * 100 : 50

  return (
    <div className="flex h-1.5 overflow-hidden rounded-full bg-background">
      <div className="h-full bg-sky-500" style={{ width: `${youPct}%` }} />
      <div className="h-full bg-violet-500" style={{ width: `${themPct}%` }} />
    </div>
  )
}

function Row({
  label,
  you,
  them,
  format,
}: {
  label: string
  you: number
  them: number
  format?: (n: number) => string
}) {
  const fmt = format ?? ((n: number) => String(n))

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">
          <span className="font-medium text-sky-500">{fmt(you)}</span>
          <span className="mx-1 text-muted">·</span>
          <span className="font-medium text-violet-500">{fmt(them)}</span>
        </span>
      </div>
      <SplitBar you={you} them={them} />
    </div>
  )
}

export default function FriendWeekCompare({
  myLabel,
  friendLabel,
  data,
}: FriendWeekCompareProps) {
  return (
    <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        You vs {friendLabel}
      </p>

      <div className="mb-3 flex justify-between text-[10px] text-muted">
        <span>{myLabel}</span>
        <span>{friendLabel}</span>
      </div>

      <div className="space-y-3">
        <Row label="Workouts" you={data.myWorkouts} them={data.friendWorkouts} />
        <Row
          label="Volume (kg)"
          you={data.myVolume}
          them={data.friendVolume}
          format={formatVolume}
        />
      </div>
    </div>
  )
}
