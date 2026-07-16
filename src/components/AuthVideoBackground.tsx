import { STARTER_VIDEO_SRC } from '../data/authMedia'

interface AuthVideoBackgroundProps {
  variant?: 'splash' | 'auth'
  className?: string
}

export default function AuthVideoBackground({
  variant = 'splash',
  className = '',
}: AuthVideoBackgroundProps) {
  const overlayClass =
    variant === 'splash'
      ? 'bg-gradient-to-t from-black via-black/70 to-black/40'
      : 'bg-gradient-to-t from-black/90 via-black/60 to-black/40'

  return (
    <div className={['absolute inset-0 overflow-hidden', className].filter(Boolean).join(' ')} aria-hidden>
      <video
        src={STARTER_VIDEO_SRC}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </div>
  )
}
