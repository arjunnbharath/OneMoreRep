import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ImageUp, Loader2, Sparkles } from 'lucide-react'
import Button from '../Button'
import { useCameraPermission } from '../../hooks/useCameraPermission'
import { classifyFoodImage, type FoodPrediction } from '../../lib/foodPhotoClassifier'
import type { FoodItem } from '../../types/nutrition'

interface FoodPhotoScannerProps {
  searchFoodOnline: (query: string) => Promise<FoodItem[]>
  searchFoodLocal: (query: string) => FoodItem[]
  onFoodSelected: (food: FoodItem) => void
}

type Phase = 'capture' | 'analyzing' | 'results'

export default function FoodPhotoScanner({
  searchFoodOnline,
  searchFoodLocal,
  onFoodSelected,
}: FoodPhotoScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [phase, setPhase] = useState<Phase>('capture')
  const [cameraError, setCameraError] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const [starting, setStarting] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<FoodPrediction[]>([])
  const [results, setResults] = useState<FoodItem[]>([])

  const { supported: cameraSupported, active, denied, requesting, enable } = useCameraPermission()

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const analyzeImage = useCallback(
    async (source: HTMLImageElement | HTMLCanvasElement) => {
      setPhase('analyzing')
      setAnalysisError('')
      setPredictions([])
      setResults([])

      try {
        const detected = await classifyFoodImage(source)
        if (detected.length === 0) {
          setAnalysisError('Could not recognize food in this photo. Try a clearer shot or search by name.')
          setPhase('capture')
          return
        }

        setPredictions(detected)

        const seen = new Set<string>()
        const merged: FoodItem[] = []

        for (const prediction of detected.slice(0, 3)) {
          for (const food of searchFoodLocal(prediction.label)) {
            if (!seen.has(food.id)) {
              seen.add(food.id)
              merged.push(food)
            }
          }
        }

        for (const prediction of detected.slice(0, 3)) {
          try {
            const online = await searchFoodOnline(prediction.label)
            for (const food of online) {
              if (!seen.has(food.id)) {
                seen.add(food.id)
                merged.push(food)
              }
            }
          } catch {
            // Continue with other labels if one search fails.
          }
        }

        if (merged.length === 0) {
          setAnalysisError(
            `Detected "${detected[0].label}" but no nutrition data found. Try searching manually.`,
          )
          setPhase('results')
          return
        }

        setResults(merged.slice(0, 12))
        setPhase('results')
        stopCamera()
      } catch (err) {
        setAnalysisError(
          err instanceof Error ? err.message : 'Photo analysis failed. Try again or search by name.',
        )
        setPhase('capture')
      }
    },
    [searchFoodLocal, searchFoodOnline, stopCamera],
  )

  const captureFromVideo = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, width, height)
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85))
    await analyzeImage(canvas)
  }, [analyzeImage])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      const img = new Image()
      img.onload = async () => {
        await analyzeImage(img)
        URL.revokeObjectURL(url)
      }
      img.onerror = () => {
        setAnalysisError('Could not load that image.')
        setPhase('capture')
        URL.revokeObjectURL(url)
      }
      img.src = url
      event.target.value = ''
    },
    [analyzeImage],
  )

  const reset = useCallback(() => {
    setPhase('capture')
    setAnalysisError('')
    setPredictions([])
    setResults([])
    setPreviewUrl(null)
  }, [])

  useEffect(() => {
    if (phase !== 'capture' || !cameraSupported || !active) {
      setStarting(false)
      return
    }

    let cancelled = false
    setStarting(true)
    setCameraError('')

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play()
        }
      })
      .catch(() => {
        if (!cancelled) setCameraError('Could not access camera.')
      })
      .finally(() => {
        if (!cancelled) setStarting(false)
      })

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [phase, cameraSupported, active, stopCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface px-4 py-16 ring-1 ring-border">
        <Loader2 size={28} className="animate-spin text-muted" />
        <p className="text-sm font-medium">Analyzing photo…</p>
        <p className="text-xs text-muted">On-device AI — no API key needed</p>
        {previewUrl && (
          <img src={previewUrl} alt="" className="mt-2 h-24 w-24 rounded-xl object-cover ring-1 ring-border" />
        )}
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="space-y-3">
        {previewUrl && (
          <img src={previewUrl} alt="" className="h-32 w-full rounded-xl object-cover ring-1 ring-border" />
        )}

        {predictions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {predictions.map((prediction) => (
              <span
                key={prediction.label}
                className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs ring-1 ring-border"
              >
                <Sparkles size={10} className="text-muted" />
                {prediction.label}
                <span className="text-muted">{Math.round(prediction.confidence * 100)}%</span>
              </span>
            ))}
          </div>
        )}

        {analysisError && <p className="text-sm text-amber-600 dark:text-amber-400">{analysisError}</p>}

        {results.length > 0 && (
          <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface ring-1 ring-border">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => onFoodSelected(food)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition active:bg-background"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{food.name}</p>
                    {food.brand && <p className="truncate text-xs text-muted">{food.brand}</p>}
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {food.caloriesPer100g} kcal
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button type="button" variant="secondary" className="w-full" onClick={reset}>
          Take another photo
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Snap a photo of your food. Recognition runs on your device; nutrition comes from Open Food Facts (free, no API key).
      </p>

      <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-border">
        {cameraSupported && active && !cameraError ? (
          <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-surface px-4 text-center">
            <Camera size={28} className="text-muted" />
            <p className="text-sm text-muted">
              {denied
                ? 'Camera is off. Enable it in Settings → Permissions, or upload a photo below.'
                : 'Enable camera or upload a photo below.'}
            </p>
            {cameraSupported && !active && !denied && (
              <Button type="button" onClick={() => void enable()} disabled={requesting}>
                {requesting ? 'Enabling…' : 'Enable camera'}
              </Button>
            )}
          </div>
        )}

        {starting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 size={24} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={() => void captureFromVideo()}
          disabled={!active || starting || !!cameraError}
          className="gap-2"
        >
          <Camera size={16} />
          Capture
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={() => fileRef.current?.click()}>
          <ImageUp size={16} />
          Upload
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      {cameraError && <p className="text-sm text-amber-600 dark:text-amber-400">{cameraError}</p>}
      {analysisError && <p className="text-sm text-amber-600 dark:text-amber-400">{analysisError}</p>}
    </div>
  )
}
