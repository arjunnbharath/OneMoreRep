export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'glutes'

export const categories: { id: MuscleGroup; label: string; icon: string }[] = [
  { id: 'chest', label: 'Chest', icon: '💪' },
  { id: 'back', label: 'Back', icon: '🔙' },
  { id: 'shoulders', label: 'Shoulders', icon: '🏋️' },
  { id: 'arms', label: 'Arms', icon: '💪' },
  { id: 'legs', label: 'Legs', icon: '🦵' },
  { id: 'core', label: 'Core', icon: '🎯' },
  { id: 'glutes', label: 'Glutes', icon: '🍑' },
]

export const workouts = [
  {
    id: 'chest-press-power',
    title: 'Chest Press Power',
    muscle: 'chest' as MuscleGroup,
    stat: '6 exercises',
    rating: 4.7,
    duration: '45 min',
    image:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    exercises: [
      { name: 'Bench Press', duration: '12 min', completed: false },
      { name: 'Incline Dumbbell Press', duration: '10 min', completed: false },
      { name: 'Cable Flyes', duration: '8 min', completed: false },
      { name: 'Push Ups', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'upper-chest-burn',
    title: 'Upper Chest Burn',
    muscle: 'chest' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.5,
    duration: '35 min',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    exercises: [
      { name: 'Incline Bench Press', duration: '12 min', completed: false },
      { name: 'Dumbbell Flyes', duration: '10 min', completed: false },
      { name: 'Chest Dips', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'chest-pump',
    title: 'Chest Pump',
    muscle: 'chest' as MuscleGroup,
    stat: '4 exercises',
    rating: 4.6,
    duration: '30 min',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    exercises: [
      { name: 'Flat Dumbbell Press', duration: '10 min', completed: false },
      { name: 'Pec Deck', duration: '8 min', completed: false },
      { name: 'Diamond Push Ups', duration: '7 min', completed: false },
    ],
  },
  {
    id: 'back-strength',
    title: 'Back Strength',
    muscle: 'back' as MuscleGroup,
    stat: '6 exercises',
    rating: 4.8,
    duration: '50 min',
    image:
      'https://images.unsplash.com/photo-1603286561831-8f228e251213?w=800&q=80',
    exercises: [
      { name: 'Deadlift', duration: '12 min', completed: false },
      { name: 'Barbell Rows', duration: '10 min', completed: false },
      { name: 'Lat Pulldown', duration: '10 min', completed: false },
      { name: 'Face Pulls', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'lat-builder',
    title: 'Lat Builder',
    muscle: 'back' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.6,
    duration: '40 min',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    exercises: [
      { name: 'Pull Ups', duration: '10 min', completed: false },
      { name: 'Seated Cable Row', duration: '10 min', completed: false },
      { name: 'Single Arm Row', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'shoulder-press-focus',
    title: 'Shoulder Press Focus',
    muscle: 'shoulders' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.5,
    duration: '38 min',
    image:
      'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
    exercises: [
      { name: 'Overhead Press', duration: '12 min', completed: false },
      { name: 'Lateral Raises', duration: '10 min', completed: false },
      { name: 'Front Raises', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'deltoid-destroyer',
    title: 'Deltoid Destroyer',
    muscle: 'shoulders' as MuscleGroup,
    stat: '6 exercises',
    rating: 4.7,
    duration: '42 min',
    image:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    exercises: [
      { name: 'Arnold Press', duration: '10 min', completed: false },
      { name: 'Rear Delt Flyes', duration: '10 min', completed: false },
      { name: 'Shrugs', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'arm-blaster',
    title: 'Arm Blaster',
    muscle: 'arms' as MuscleGroup,
    stat: '6 exercises',
    rating: 4.6,
    duration: '35 min',
    image:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    exercises: [
      { name: 'Barbell Curls', duration: '10 min', completed: false },
      { name: 'Tricep Pushdown', duration: '10 min', completed: false },
      { name: 'Hammer Curls', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'bicep-tricep-split',
    title: 'Bicep & Tricep Split',
    muscle: 'arms' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.4,
    duration: '32 min',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    exercises: [
      { name: 'Preacher Curls', duration: '10 min', completed: false },
      { name: 'Skull Crushers', duration: '10 min', completed: false },
      { name: 'Cable Curls', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'leg-day-crusher',
    title: 'Leg Day Crusher',
    muscle: 'legs' as MuscleGroup,
    stat: '7 exercises',
    rating: 4.8,
    duration: '55 min',
    image:
      'https://images.unsplash.com/photo-1434682881348-1deda2a010f5?w=800&q=80',
    exercises: [
      { name: 'Barbell Squat', duration: '12 min', completed: false },
      { name: 'Romanian Deadlift', duration: '10 min', completed: false },
      { name: 'Leg Press', duration: '10 min', completed: false },
      { name: 'Calf Raises', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'quad-focus',
    title: 'Quad Focus',
    muscle: 'legs' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.5,
    duration: '40 min',
    image:
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
    exercises: [
      { name: 'Front Squat', duration: '12 min', completed: false },
      { name: 'Leg Extension', duration: '10 min', completed: false },
      { name: 'Walking Lunges', duration: '10 min', completed: false },
    ],
  },
  {
    id: 'core-strength',
    title: 'Core Strength',
    muscle: 'core' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.6,
    duration: '25 min',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    exercises: [
      { name: 'Plank Hold', duration: '5 min', completed: true },
      { name: 'Russian Twists', duration: '8 min', completed: false },
      { name: 'Hanging Leg Raises', duration: '8 min', completed: false },
      { name: 'Ab Wheel Rollout', duration: '6 min', completed: false },
    ],
  },
  {
    id: 'ab-shred',
    title: 'Ab Shred',
    muscle: 'core' as MuscleGroup,
    stat: '4 exercises',
    rating: 4.7,
    duration: '20 min',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b46d2?w=800&q=80',
    exercises: [
      { name: 'Bicycle Crunches', duration: '6 min', completed: false },
      { name: 'Mountain Climbers', duration: '6 min', completed: false },
      { name: 'Dead Bug', duration: '5 min', completed: false },
    ],
  },
  {
    id: 'glute-builder',
    title: 'Glute Builder',
    muscle: 'glutes' as MuscleGroup,
    stat: '5 exercises',
    rating: 4.7,
    duration: '38 min',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    exercises: [
      { name: 'Hip Thrust', duration: '12 min', completed: false },
      { name: 'Bulgarian Split Squat', duration: '10 min', completed: false },
      { name: 'Glute Bridge', duration: '8 min', completed: false },
    ],
  },
  {
    id: 'glute-burn',
    title: 'Glute Burn',
    muscle: 'glutes' as MuscleGroup,
    stat: '4 exercises',
    rating: 4.5,
    duration: '30 min',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    exercises: [
      { name: 'Cable Kickbacks', duration: '10 min', completed: false },
      { name: 'Sumo Deadlift', duration: '10 min', completed: false },
      { name: 'Step Ups', duration: '8 min', completed: false },
    ],
  },
]

export const heroImage =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80'
