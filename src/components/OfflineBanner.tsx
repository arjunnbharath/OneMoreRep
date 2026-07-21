import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useSyncStatus } from '../hooks/useSyncStatus'

export default function OfflineBanner() {
  const online = useOnlineStatus()
  const { hasPendingSync } = useSyncStatus()

  if (online && !hasPendingSync) return null

  return (
    <div
      className={[
        'fixed inset-x-0 top-0 z-[190] px-4 pt-[max(0.5rem,env(safe-area-inset-top))]',
        'pointer-events-none',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex max-w-lg items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-medium shadow-lg ring-1',
          online
            ? 'bg-amber-500/95 text-white ring-amber-600/30'
            : 'bg-foreground/95 text-background ring-border/20',
        ].join(' ')}
      >
        <WifiOff size={14} className="shrink-0" />
        <span>
          {online
            ? 'Back online — syncing your changes…'
            : 'Offline mode — workouts and food logs save on this device'}
        </span>
      </div>
    </div>
  )
}
