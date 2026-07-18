import { EXERCISE_LIBRARY_DESIGN } from '../../lib/exerciseLibraryConfig'
import ExerciseGuidesV1 from './ExerciseGuidesV1'
import ExerciseGuidesV2 from './ExerciseGuidesV2'

interface ExerciseLibraryPanelProps {
  embedded?: boolean
  onBack?: () => void
}

export default function ExerciseLibraryPanel({ embedded = false, onBack }: ExerciseLibraryPanelProps) {
  if (EXERCISE_LIBRARY_DESIGN === 'v1') {
    return <ExerciseGuidesV1 embedded={embedded} onBack={onBack} />
  }

  return <ExerciseGuidesV2 embedded={embedded} onBack={onBack} />
}
