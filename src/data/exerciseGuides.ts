export type ExerciseGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abdominals'
  | 'legs'
  | 'calves'

export interface ExerciseGuide {
  id: string
  name: string
  group: ExerciseGroup
  equipment: string
  description: string
  steps: string[]
  tips: string[]
  image: string
}

export const exerciseGroupLabels: Record<ExerciseGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  abdominals: 'Abdominals',
  legs: 'Legs',
  calves: 'Calves',
}

const groupImages: Record<ExerciseGroup, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  back: 'https://images.unsplash.com/photo-1603286561831-8f228e251213?w=800&q=80',
  shoulders: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
  biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  triceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  abdominals: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b46d2?w=800&q=80',
  legs: 'https://images.unsplash.com/photo-1434682881348-1deda2a010f5?w=800&q=80',
  calves: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function inferEquipment(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('dumbbell')) return 'Dumbbell'
  if (n.includes('barbell')) return 'Barbell'
  if (n.includes('cable') || n.includes('pulldown') || n.includes('pulley')) return 'Cable'
  if (n.includes('machine') || n.includes('pec deck') || n.includes('hack squat')) return 'Machine'
  if (n.includes('kettlebell')) return 'Kettlebell'
  if (n.includes('band') || n.includes('mini-band')) return 'Resistance band'
  if (n.includes('bodyweight') || n.includes('push up') || n.includes('pull up') || n.includes('plank') || n.includes('burpee') || n.includes('lunge') && !n.includes('dumbbell')) return 'Bodyweight'
  if (n.includes('smith')) return 'Smith machine'
  if (n.includes('ez bar')) return 'EZ bar'
  if (n.includes('medicine ball')) return 'Medicine ball'
  if (n.includes('trap bar')) return 'Trap bar'
  return 'Gym equipment'
}

function makeExercise(name: string, group: ExerciseGroup): ExerciseGuide {
  const equipment = inferEquipment(name)
  return {
    id: slugify(name),
    name,
    group,
    equipment,
    description: `${name} targets the ${exerciseGroupLabels[group].toLowerCase()} with a focus on controlled reps, stable joints, and full range of motion.`,
    steps: [
      'Set your stance and grip, brace your core, and keep shoulders packed.',
      'Lower or extend through the working range with a slow, controlled tempo.',
      'Drive back to the start position without using momentum or bouncing.',
    ],
    tips: [
      'Warm up with lighter weight before working sets.',
      'Stop the set when form breaks down, not when you hit a rep goal.',
      'Breathe out on the effort phase and keep tension on the target muscle.',
    ],
    image: groupImages[group],
  }
}

const exerciseNames: Record<ExerciseGroup, string[]> = {
  chest: [
    'Barbell Bench Press',
    'Incline Dumbbell Bench Press',
    'Pec Deck',
    'Cable Crossover',
    'Incline Barbell Bench Press',
    'Dumbbell Bench Press',
    'Dumbbell Fly',
    'Incline Dumbbell Fly',
    'Chest Press Machine',
    'Barbell Declined Bench Press',
    'Dumbbell Declined Bench Press',
    'Push Ups',
  ],
  back: [
    'Dumbbell Bent-Over Row (Single Arm)',
    'Wide-Grip Pulldown',
    'Seated Cable Row',
    'Close-Grip Pulldown',
    'Barbell Row',
    'Behind-Neck Pulldown',
    'Reverse-Grip Pulldown',
    'Rope Pulldown',
    'T-Bar Rows',
    'Barbell Bent Over Rows Supinated Grip',
    'Pull Up',
    'Behind the Neck Pull Up',
    'Pull Up with a Supinated Grip',
    'Straight Arm Lat Pulldown',
    'Dumbbell Bent Over Rows',
    'Dumbbell Pullover',
    'Barbell Pullover',
    'Barbell Deadlift',
    'Barbell Sumo Deadlift',
    'Trap Bar Deadlift',
    'Dumbbell Deadlift',
    'Barbell Shrug',
    'Dumbbell Shrugs',
  ],
  shoulders: [
    'Dumbbell Shoulder Press',
    'Dumbbell Lateral Raise',
    'Dumbbell Front Raise',
    'High Cable Rear Delt Fly',
    'Smith Machine Shoulder Press',
    'Barbell Upright Row',
    'Bent-Over Lateral Raise',
    'Cable One-Arm Lateral Raise',
    'Dumbbell Push Press',
    'Barbell Push Press',
    'Single-Arm Cable Front Raise',
    'Barbell Front Raise',
    'Seated Barbell Shoulder Press',
    'Seated Behind the Neck Barbell Shoulder Press',
    'Standing Barbell Shoulder Press',
    'Standing Behind the Neck Barbell Shoulder Press',
    'Alternate Dumbbell Front Raise Neutral Grip',
    'One-Arm Low-Pulley Front Raise Neutral Grip',
    'Two-Handed Dumbbell Front Raise',
  ],
  biceps: [
    'Barbell Curl',
    'Alternating Dumbbell Curl',
    'Rope Cable Curl',
    'EZ Barbell Curl',
    'EZ Barbell Preacher Curl',
    'Hammer Curl',
    'Incline Dumbbell Curl',
    'Dumbbell Concentration Curl',
    'Single-Arm Low Pulley Cable Curl',
    'Straight Bar Low Pulley Cable Curl',
    'Standing High Pulley Cable Curl',
    'Seated Barbell Wrist Curl',
    'Seated Barbell Wrist Extension',
    'Reverse Barbell Curl',
  ],
  triceps: [
    'Lying Triceps Extension',
    'Triceps Pressdown',
    'Cable Rope Pushdown',
    'Dumbbell Overhead Triceps Extension',
    'Close Grip Bench Press',
    'Kickback',
    'Reverse Grip Cable Triceps Extension with Barbell',
    'Single-Arm Cable Triceps Extension',
    'Single-Arm Cable Triceps Extension with Supinated Grip',
    'Lying Dumbbell Triceps Extension',
    'Seated Barbell French Press',
    'Bench Dips',
    'Parallel Dip Bar',
  ],
  abdominals: [
    'Crunch',
    'Oblique Crunch',
    'Crunch Machine',
    'Rope Ab Pulldown',
    'Plank',
    'Hanging Leg Raise',
    'Bent Knee Reverse Crunch',
    'Long Arm Crunch',
    'Plank Get Ups',
  ],
  legs: [
    'Squat',
    'Leg Press',
    'Leg Extension',
    'Lunge',
    'Lying Leg Curl',
    'Hack Squat',
    'Seated Leg Curl',
    'Single Leg Extension',
    'Front Squat',
    'Dumbbell Stiff-Leg Deadlift',
    'Barbell Stiff-Leg Deadlift',
    'Dumbbell Goblet Squat',
    'Knee Tuck Jumps',
    'Burpees',
    'Bodyweight Squat',
    '1.5 Rep Bodyweight Squats',
    'Medicine Ball Squat',
    'Barbell Bulgarian Split Squat',
    'Bodyweight Bulgarian Split Squat',
    'Mini-Band Air Squat',
    'Jump Squat',
    'Wall Sit',
    'Medicine Ball Deadlift',
    'Single Leg Bodyweight Deadlift',
    'Kettlebell Sumo Deadlift',
    'Good Morning',
    'Bodyweight Glute Bridge',
    'Single Leg Glute Bridge',
    'Banded Glute Bridge',
    'Duck Walk',
    'Bird Dog',
    'Groiners',
    'Fire Hydrants',
    'Smith Machine Hip Thrust',
    'Barbell Hip Thrust',
    'Band Seated Hip Abduction',
    'Seated Hip Abduction Machine',
    'Standing Cable Abduction',
    'Bodyweight Frog Pump',
    'Smith Machine Frog Pump',
    'Banded Clams',
    'Side Lying Leg Raise',
    'Glute Ham Raise',
    'Dumbbell Step Up',
    'Lateral Mini-Band Walk',
    'Standing Knee Raise',
    'Kettlebell Swings',
    'Standing Cable Kickback',
    'Donkey Kicks',
    'Side Lying Hip Raise',
    'Squat Sit to Reach',
  ],
  calves: ['Seated Calf Raise', 'Standing Calf Raise'],
}

export const exerciseGuides: ExerciseGuide[] = (
  Object.entries(exerciseNames) as [ExerciseGroup, string[]][]
).flatMap(([group, names]) => names.map((name) => makeExercise(name, group)))

export const exerciseGroups = (Object.keys(exerciseGroupLabels) as ExerciseGroup[]).map(
  (id) => ({
    id,
    label: exerciseGroupLabels[id],
    count: exerciseGuides.filter((e) => e.group === id).length,
    image: groupImages[id],
  }),
)

export function getExerciseById(id: string) {
  return exerciseGuides.find((e) => e.id === id)
}

export function getExercisesByGroup(group: ExerciseGroup) {
  return exerciseGuides.filter((e) => e.group === group)
}
