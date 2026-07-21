import { useCallback, useEffect, useRef, useState } from 'react'
import { Barcode, Camera, Loader2 } from 'lucide-react'
import Button from '../Button'
import { useCameraPermission } from '../../hooks/useCameraPermission'
import { extractBarcodeFromScan } from '../../lib/barcodeScan'
import { formatMacroPreview, formatNutritionPer100g } from '../../lib/foodNutritionDisplay'
import { macrosForGrams } from '../../lib/nutritionMath'
import type { FoodItem } from '../../types/nutrition'

interface BarcodeScannerProps {
  lookupBarcode: (scanValue: string) => Promise<FoodItem | null>
  onFoodFound: (food: FoodItem, servingGrams: number) => void
  onClose: () => void
}

const SCAN_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] as const
const SERVING_PRESETS = [50, 100, 150, 200]

export default function BarcodeScanner({ lookupBarcode, onFoodFound, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [starting, setStarting] = useState(true)
  const [lookingUp, setLookingUp] = useState(false)
  const [foundFood, setFoundFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('100')
  const streamRef = useRef<MediaStream | null>(null)
  const lastLookupRef = useRef('')
  const lookupBarcodeRef = useRef(lookupBarcode)

  const { supported: cameraSupported, active, denied, requesting, enable } = useCameraPermission()

  useEffect(() => {
    lookupBarcodeRef.current = lookupBarcode
  }, [lookupBarcode])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const runLookup = useCallback(async (scanValue: string) => {
    const extracted = extractBarcodeFromScan(scanValue)
    if (!extracted) {
      setLookupError('Could not read a valid barcode from that scan.')
      return
    }

    if (lastLookupRef.current === extracted) return
    lastLookupRef.current = extracted

    setLookupError('')
    setLookingUp(true)
    setFoundFood(null)

    try {
      const food = await lookupBarcodeRef.current(scanValue)
      if (!food) {
        setLookupError(
          `Product not found for barcode ${extracted}. Try searching by name instead.`,
        )
        lastLookupRef.current = ''
        return
      }

      setFoundFood(food)
      setGrams(String(food.suggestedServingGrams ?? 100))
      stopCamera()
    } catch (err) {
      setLookupError(
        err instanceof Error ? err.message : 'Lookup failed. Check your connection and try again.',
      )
      lastLookupRef.current = ''
    } finally {
      setLookingUp(false)
    }
  }, [stopCamera])

  useEffect(() => {
    let cancelled = false
    let detector: InstanceType<NonNullable<Window['BarcodeDetector']>> | null = null
    let frame = 0

    async function start() {
      if (!('BarcodeDetector' in window) || !active) {
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

        detector = new window.BarcodeDetector!({ formats: [...SCAN_FORMATS] })

        const scan = async () => {
          if (cancelled || !videoRef.current || !detector || lookingUp || foundFood) return
          try {
            const codes = await detector.detect(videoRef.current)
            const match = codes.find((code) => Boolean(code.rawValue?.trim()))
            if (match?.rawValue) {
              void runLookup(match.rawValue.trim())
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
  }, [active, lookingUp, foundFood, runLookup, stopCamera])

  useEffect(() => {
    const normalized = extractBarcodeFromScan(manualCode)
    if (!normalized || normalized.length < 8) return

    const timer = window.setTimeout(() => {
      void runLookup(manualCode)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [manualCode, runLookup])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (manualCode.trim()) void runLookup(manualCode.trim())
  }

  function handleLogFound() {
    if (!foundFood) return
    onFoodFound(foundFood, Number(grams) || 100)
  }

  function resetScan() {
    lastLookupRef.current = ''
    setFoundFood(null)
    setLookupError('')
    setManualCode('')
    setCameraError('')
  }

  const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window
  const preview = foundFood ? macrosForGrams(foundFood, Number(grams) || 0) : null

  if (foundFood && preview) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
          <p className="font-medium">{foundFood.name}</p>
          {foundFood.brand && <p className="text-xs text-muted">{foundFood.brand}</p>}
          <p className="mt-2 text-xs text-muted">{formatNutritionPer100g(foundFood)}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SERVING_PRESETS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrams(String(g))}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition',
                Number(grams) === g
                  ? 'bg-foreground text-background'
                  : 'bg-surface text-muted ring-1 ring-border',
              ].join(' ')}
            >
              {g}g
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-surface px-4 py-3 text-sm ring-1 ring-border">
          <span className="font-medium tabular-nums">{preview.calories} kcal</span>
          <span className="text-muted"> {formatMacroPreview(preview)}</span>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={resetScan}>
            Scan again
          </Button>
          <Button type="button" className="flex-1" onClick={handleLogFound}>
            Add to log
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cameraSupported && !active && (
        <div className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
          <div className="flex items-start gap-3">
            <Camera size={18} className="mt-0.5 shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Camera access needed</p>
              <p className="mt-1 text-xs text-muted">
                {denied
                  ? 'Camera is blocked. Allow it in Profile → Settings → Permissions, or in your browser site settings.'
                  : 'Turn on camera in Profile → Settings → Permissions to scan barcodes and QR codes.'}
              </p>
              {!denied && (
                <Button
                  type="button"
                  className="mt-3 w-full py-2.5 text-sm"
                  disabled={requesting}
                  onClick={() => void enable()}
                >
                  {requesting ? 'Turning on…' : 'Turn on camera'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {hasDetector && active ? (
        <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-border">
          <video
            ref={videoRef}
            className="aspect-[4/3] w-full object-cover"
            playsInline
            muted
          />
          {(starting || lookingUp) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-xs">{lookingUp ? 'Looking up product…' : 'Starting camera…'}</p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/70" />
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-white/80">
            Point at a barcode or QR code
          </p>
        </div>
      ) : active ? (
        <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border">
          <Camera size={28} className="mx-auto text-muted" />
          <p className="mt-2 text-sm text-muted">
            Camera scanning isn&apos;t supported in this browser. Enter the barcode below.
          </p>
        </div>
      ) : null}

      {cameraError && <p className="text-xs text-amber-600 dark:text-amber-400">{cameraError}</p>}
      {lookupError && <p className="text-xs text-red-600 dark:text-red-400">{lookupError}</p>}

      <form onSubmit={handleManualSubmit} className="space-y-3">
        <label className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
          <Barcode size={16} className="shrink-0 text-muted" />
          <input
            value={manualCode}
            onChange={(e) => {
              setManualCode(e.target.value)
              setLookupError('')
              lastLookupRef.current = ''
            }}
            placeholder="Enter barcode or paste QR content"
            className="w-full bg-transparent text-sm outline-none"
            autoFocus={!hasDetector || !active}
          />
        </label>
        {lookingUp && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" />
            Searching food database…
          </p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={!extractBarcodeFromScan(manualCode) || lookingUp}
          >
            Look up
          </Button>
        </div>
      </form>
    </div>
  )
}
