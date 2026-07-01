import manifest from '../../public/workout-videos-manifest.json'

export interface WorkoutVideoCategory {
  id: string
  folderName: string
  label: string
  videoPath: string
  available: boolean
  source?: string
}

export interface WorkoutVideoManifest {
  source: string
  sourceUrl: string
  categoryCount: number
  categories: WorkoutVideoCategory[]
}

export const workoutVideoManifest = manifest as WorkoutVideoManifest

export const workoutVideoCategories = workoutVideoManifest.categories.filter(
  (c) => c.available,
)

export const allWorkoutVideoCategories = workoutVideoManifest.categories

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const aliasToCategoryId: Record<string, string> = {
  'barbell curl': 'barbell-biceps-curl',
  'bicep curl': 'barbell-biceps-curl',
  'push ups': 'push-up',
  'pushups': 'push-up',
  'pull ups': 'pull-up',
  'pullups': 'pull-up',
  'pull-up': 'pull-up',
  'bench press': 'bench-press',
  'flat bench press': 'bench-press',
  'dumbbell bench press': 'bench-press',
  'incline bench press': 'incline-bench-press',
  'incline dumbbell bench press': 'incline-bench-press',
  'decline bench press': 'decline-bench-press',
  'shoulder press': 'shoulder-press',
  'dumbbell shoulder press': 'shoulder-press',
  'overhead press': 'shoulder-press',
  'lateral raise': 'lateral-raise',
  'dumbbell lateral raise': 'lateral-raise',
  'lat pulldown': 'lat-pulldown',
  'hammer curl': 'hammer-curl',
  'tricep pushdown': 'tricep-pushdown',
  'cable rope pushdown': 'tricep-pushdown',
  'triceps pressdown': 'tricep-pushdown',
  'bench dips': 'tricep-dips',
  'parallel dip bar': 'tricep-dips',
  'barbell squat': 'squat',
  'front squat': 'squat',
  'bodyweight squat': 'squat',
  'goblet squat': 'squat',
  'dumbbell goblet squat': 'squat',
  'leg extension': 'leg-extension',
  'hanging leg raise': 'leg-raises',
  'plank': 'plank',
  'plank hold': 'plank',
  'russian twists': 'russian-twist',
  'barbell deadlift': 'deadlift',
  'romanian deadlift': 'romanian-deadlift',
  'barbell stiff-leg deadlift': 'romanian-deadlift',
  'hip thrust': 'hip-thrust',
  'barbell hip thrust': 'hip-thrust',
  'pec deck': 'chest-fly-machine',
  'cable crossover': 'chest-fly-machine',
  'dumbbell fly': 'chest-fly-machine',
  'barbell row': 't-bar-row',
  'seated cable row': 't-bar-row',
  'dumbbell bent over rows': 't-bar-row',
  't-bar rows': 't-bar-row',
}

function scoreMatch(exerciseName: string, category: WorkoutVideoCategory) {
  const exercise = normalize(exerciseName)
  const label = normalize(category.label)
  const folder = normalize(category.folderName)

  if (exercise === label || exercise === folder) return 100
  if (exercise.includes(label) || label.includes(exercise)) return 80
  if (exercise.includes(folder) || folder.includes(exercise)) return 75

  const exerciseTokens = new Set(exercise.split(' '))
  const labelTokens = label.split(' ')
  const overlap = labelTokens.filter((t) => exerciseTokens.has(t)).length
  return overlap * 10
}

export function getVideoCategoryById(id: string) {
  return allWorkoutVideoCategories.find((c) => c.id === id)
}

export function findVideoForExercise(exerciseName: string): WorkoutVideoCategory | null {
  const normalized = normalize(exerciseName)
  const aliasId = aliasToCategoryId[normalized]
  if (aliasId) {
    const match = getVideoCategoryById(aliasId)
    if (match?.available) return match
  }

  let best: WorkoutVideoCategory | null = null
  let bestScore = 0

  for (const category of workoutVideoCategories) {
    const score = scoreMatch(exerciseName, category)
    if (score > bestScore) {
      bestScore = score
      best = category
    }
  }

  return bestScore >= 30 ? best : null
}

export function getDefaultWorkoutVideo() {
  return workoutVideoCategories[0] ?? null
}
