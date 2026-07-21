import { useCallback, useEffect, useRef, useState } from 'react'
import { Barcode, Camera, Loader2 } from 'lucide-react'
import Button from '../Button'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [starting, setStarting] = useState(true)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    let cancelled = false
    let detector: InstanceType<NonNullable<Window['BarcodeDetector']>> | null = null
    let frame = 0

    async function start() {
      if (!('BarcodeDetector' in window)) {
        setStarting(false)
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        detector = new window.BarcodeDetector!({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })

        const scan = async () => {
          if (cancelled || !videoRef.current || !detector) return
          try {
            const codes = await detector.detect(videoRef.current)
            const match = codes.find((code) => (code.rawValue?.replace(/\D/g, '').length ?? 0) >= 8)
            if (match?.rawValue) {
              onScan(match.rawValue.replace(/\D/g, ''))
              return
            }
          } catch {
            // keep scanning
          }
          frame = requestAnimationFrame(() => {
            void scan()
          })
        }

        setStarting(false)
        void scan()
      } catch {
        setCameraError('Camera unavailable. Enter the barcode manually below.')
        setStarting(false)
      }
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      stopCamera()
    }
  }, [onScan, stopCamera])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = manualCode.replace(/\D/g, '')
    if (normalized.length >= 8) onScan(normalized)
  }

  const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window

  return (
    <div className="space-y-4">
      {hasDetector ? (
        <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-border">
          <video
            ref={videoRef}
            className="aspect-[4/3] w-full object-cover"
            playsInline
            muted
          />
          {starting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/70" />
        </div>
      ) : (
        <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border">
          <Camera size={28} className="mx-auto text-muted" />
          <p className="mt-2 text-sm text-muted">
            Camera scanning isn&apos;t supported in this browser. Enter the barcode below.
          </p>
        </div>
      )}

      {cameraError && <p className="text-xs text-amber-600 dark:text-amber-400">{cameraError}</p>}

      <form onSubmit={handleManualSubmit} className="space-y-3">
        <label className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
          <Barcode size={16} className="shrink-0 text-muted" />
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter barcode number"
            inputMode="numeric"
            className="w-full bg-transparent text-sm outline-none"
            autoFocus={!hasDetector}
          />
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={manualCode.replace(/\D/g, '').length < 8}>
            Look up
          </Button>
        </div>
      </form>
    </div>
  )
}
