import { Navigate } from 'react-router-dom'
import ExerciseLibraryPanel from '../components/exercise-library/ExerciseLibraryPanel'
import { EXERCISE_LIBRARY_DESIGN } from '../lib/exerciseLibraryConfig'
import { TRACKER_PATHS } from '../lib/trackerPaths'

export default function ExerciseGuides() {
  if (EXERCISE_LIBRARY_DESIGN === 'v2') {
    return <Navigate to={TRACKER_PATHS.exerciseLibrary} replace />
  }

  return <ExerciseLibraryPanel />
}
