import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface ExerciseVideoPlayerProps {
  src: string
  poster?: string
  title: string
  className?: string
  showMuteToggle?: boolean
}

export default function ExerciseVideoPlayer({
  src,
  poster,
  title,
  className = '',
  showMuteToggle = true,
}: ExerciseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
    void video.play().catch(() => {})
  }, [src, muted])

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        key={src}
        src={src}
        poster={poster}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
        aria-label={`${title} demo video`}
        className="h-full w-full object-cover"
      >
        <track kind="captions" />
      </video>

      {showMuteToggle && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  )
}
