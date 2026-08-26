import { EXERCISE_LIBRARY_DESIGN } from '../../lib/exerciseLibraryConfig'
import type { ExerciseGroup } from '../../data/exerciseGuides'
import ExerciseGuidesV1 from './ExerciseGuidesV1'
import ExerciseGuidesV2 from './ExerciseGuidesV2'

interface ExerciseLibraryPanelProps {
  embedded?: boolean
  onBack?: () => void
  initialGroup?: ExerciseGroup | 'all'
}

export default function ExerciseLibraryPanel({
  embedded = false,
  onBack,
  initialGroup = 'all',
}: ExerciseLibraryPanelProps) {
  if (EXERCISE_LIBRARY_DESIGN === 'v1') {
    return <ExerciseGuidesV1 embedded={embedded} onBack={onBack} initialGroup={initialGroup} />
  }

  return <ExerciseGuidesV2 embedded={embedded} onBack={onBack} initialGroup={initialGroup} />
}
