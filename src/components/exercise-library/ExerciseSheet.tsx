import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExerciseDetail from '../../pages/ExerciseDetail'

/** Shows the exercise guide in the same sliding sheet as Add Food. */
export default function ExerciseSheet() {
  const navigate = useNavigate()
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  function close() {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => navigate(-1), 300)
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close exercise"
        onClick={close}
        className={[
          'sheet-backdrop absolute inset-0 bg-black/45',
          closing ? 'sheet-backdrop--closed' : '',
        ].join(' ')}
      />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div
          className={[
            'sheet-panel w-full max-w-lg overflow-hidden rounded-t-3xl bg-background shadow-2xl ring-1 ring-border',
            closing ? 'sheet-panel--closed' : '',
          ].join(' ')}
          style={{ height: 'min(92dvh, calc(720px + var(--mobile-nav-height)))' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="scrollbar-hide h-full overflow-y-auto overscroll-contain">
            <ExerciseDetail onClose={close} />
          </div>
        </div>
      </div>
    </div>
  )
}
