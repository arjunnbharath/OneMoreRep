import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { compressImageToDataUrl } from '../lib/image'

interface SelfieCameraModalProps {
  open: boolean
  onClose: () => void
  onCapture: (dataUrl: string) => void
}

export default function SelfieCameraModal({ open, onClose, onCapture }: SelfieCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (!open) return

    setError('')
    setReady(false)
    let cancelled = false

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera is not supported on this device')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
          setReady(true)
        }
      } catch {
        setError('Could not access camera. Allow camera permission and try again.')
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [open])

  async function handleCapture() {
    const video = videoRef.current
    if (!video || !ready) return

    setCapturing(true)
    setError('')

    try {
      const size = Math.min(video.videoWidth, video.videoHeight)
      const sx = (video.videoWidth - size) / 2
      const sy = (video.videoHeight - size) / 2

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not capture photo')

      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size)

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
      })

      if (!blob) throw new Error('Could not capture photo')

      const dataUrl = await compressImageToDataUrl(blob)
      if (dataUrl.length > 500_000) {
        setError('Photo is too large. Try again closer to the camera.')
        return
      }

      onCapture(dataUrl)
      onClose()
    } catch {
      setError('Could not capture photo')
    } finally {
      setCapturing(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-background ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-semibold">Take a selfie</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-square bg-black">
          {!error && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          {error && (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
              {error}
            </div>
          )}
          {ready && !error && (
            <div className="pointer-events-none absolute inset-8 rounded-full border-2 border-white/40" />
          )}
        </div>

        <div className="flex gap-3 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-surface py-3 text-sm font-semibold ring-1 ring-border"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleCapture()}
            disabled={!ready || capturing || !!error}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            <Camera size={18} />
            {capturing ? 'Saving...' : 'Capture'}
          </button>
        </div>
      </div>
    </div>
  )
}
