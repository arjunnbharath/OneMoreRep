import { useState } from 'react'
import type { ExerciseGroup } from '../data/exerciseGuides'
import { exerciseGroupImage } from '../data/exerciseGuides'

interface ExerciseImageProps {
  src: string
  group: ExerciseGroup
  alt?: string
  className?: string
}

export default function ExerciseImage({ src, group, alt = '', className = '' }: ExerciseImageProps) {
  const fallback = exerciseGroupImage(group)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [triedJpg, setTriedJpg] = useState(false)

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc.endsWith('.gif') && !triedJpg) {
          setTriedJpg(true)
          setCurrentSrc(currentSrc.replace(/\.gif$/i, '.jpg'))
          return
        }
        if (currentSrc !== fallback) setCurrentSrc(fallback)
      }}
    />
  )
}
