import { useRef, useState } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { compressImageToDataUrl } from '../lib/image'
import SelfieCameraModal from './SelfieCameraModal'

interface SelfieCaptureProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
}

export default function SelfieCapture({ value, onChange }: SelfieCaptureProps) {
  const galleryRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image is too large (max 8MB)')
      return
    }

    try {
      const dataUrl = await compressImageToDataUrl(file)
      if (dataUrl.length > 500_000) {
        setError('Image is still too large after compression. Try a smaller photo.')
        return
      }
      onChange(dataUrl)
    } catch {
      setError('Could not process that image')
    }
  }

  return (
    <>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">Profile selfie</label>

        <div className="flex items-center gap-4">
          <div className="relative">
            {value ? (
              <img
                src={value}
                alt="Your selfie preview"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface ring-2 ring-dashed ring-border">
                <Camera size={28} className="text-muted" />
              </div>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove selfie"
                className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface ring-1 ring-border"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              <Camera size={16} />
              Take selfie
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-sm font-medium ring-1 ring-border transition hover:bg-surface-elevated"
            >
              <ImagePlus size={16} />
              Upload photo
            </button>
          </div>
        </div>

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {!value && !error && (
          <p className="text-xs text-muted">A selfie is required to create your account.</p>
        )}
      </div>

      <SelfieCameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => {
          setError('')
          onChange(dataUrl)
        }}
      />
    </>
  )
}
