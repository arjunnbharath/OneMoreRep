// Exercise seed data — Dart dictionary structure.
// Use this to seed your local SQLite/Drift database on first app launch.

enum MuscleGroup {
  chest,
  back,
  shoulders,
  biceps,
  triceps,
  quads,
  hamstrings,
  glutes,
  calves,
  core,
  fullBody,
}

enum EquipmentType {
  barbell,
  dumbbell,
  machine,
  bodyweight,
  cable,
  kettlebell,
  resistanceBand,
  other,
}

class ExerciseSeed {
  final String name;
  final MuscleGroup primaryMuscle;
  final List<MuscleGroup> secondaryMuscles;
  final EquipmentType equipment;

  const ExerciseSeed({
    required this.name,
    required this.primaryMuscle,
    this.secondaryMuscles = const [],
    required this.equipment,
  });
}

/// Dictionary: MuscleGroup -> List of exercises targeting it primarily.
final Map<MuscleGroup, List<ExerciseSeed>> exerciseDatabase = {
  MuscleGroup.chest: [
    ExerciseSeed(name: 'Barbell Bench Press', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.triceps, MuscleGroup.shoulders], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Incline Barbell Bench Press', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.shoulders, MuscleGroup.triceps], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Decline Barbell Bench Press', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.triceps], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Dumbbell Bench Press', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.triceps, MuscleGroup.shoulders], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Incline Dumbbell Press', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.shoulders], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Dumbbell Flyes', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Incline Dumbbell Flyes', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Cable Crossover', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Low-to-High Cable Fly', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Chest Press Machine', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.triceps], equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Pec Deck Machine', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Push-Ups', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.triceps, MuscleGroup.core], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Incline Push-Ups', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Decline Push-Ups', primaryMuscle: MuscleGroup.chest, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Dips (Chest-Focused)', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.triceps], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Landmine Press', primaryMuscle: MuscleGroup.chest, secondaryMuscles: [MuscleGroup.shoulders], equipment: EquipmentType.barbell),
  ],

  MuscleGroup.back: [
    ExerciseSeed(name: 'Deadlift', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.hamstrings, MuscleGroup.glutes], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Barbell Bent-Over Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Pull-Ups', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Chin-Ups', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Lat Pulldown', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Seated Cable Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Single-Arm Dumbbell Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'T-Bar Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Chest-Supported Row', primaryMuscle: MuscleGroup.back, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Straight-Arm Pulldown', primaryMuscle: MuscleGroup.back, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Face Pull', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.shoulders], equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Inverted Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Rack Pulls', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.hamstrings], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Meadows Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.biceps], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Renegade Row', primaryMuscle: MuscleGroup.back, secondaryMuscles: [MuscleGroup.core], equipment: EquipmentType.dumbbell),
  ],

  MuscleGroup.shoulders: [
    ExerciseSeed(name: 'Barbell Overhead Press', primaryMuscle: MuscleGroup.shoulders, secondaryMuscles: [MuscleGroup.triceps], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Seated Dumbbell Shoulder Press', primaryMuscle: MuscleGroup.shoulders, secondaryMuscles: [MuscleGroup.triceps], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Arnold Press', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Lateral Raise', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Cable Lateral Raise', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Front Raise', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Rear Delt Fly', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Reverse Pec Deck', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Upright Row', primaryMuscle: MuscleGroup.shoulders, secondaryMuscles: [MuscleGroup.back], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Shrugs', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Dumbbell Shrugs', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Push Press', primaryMuscle: MuscleGroup.shoulders, secondaryMuscles: [MuscleGroup.triceps, MuscleGroup.quads], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Machine Shoulder Press', primaryMuscle: MuscleGroup.shoulders, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Pike Push-Up', primaryMuscle: MuscleGroup.shoulders, secondaryMuscles: [MuscleGroup.triceps], equipment: EquipmentType.bodyweight),
  ],

  MuscleGroup.biceps: [
    ExerciseSeed(name: 'Barbell Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'EZ-Bar Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Dumbbell Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Hammer Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Incline Dumbbell Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Concentration Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Preacher Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Cable Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Cable Rope Hammer Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Chin-Up (Bicep-Focused)', primaryMuscle: MuscleGroup.biceps, secondaryMuscles: [MuscleGroup.back], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Spider Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Resistance Band Curl', primaryMuscle: MuscleGroup.biceps, equipment: EquipmentType.resistanceBand),
  ],

  MuscleGroup.triceps: [
    ExerciseSeed(name: 'Close-Grip Bench Press', primaryMuscle: MuscleGroup.triceps, secondaryMuscles: [MuscleGroup.chest], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Triceps Pushdown', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Overhead Cable Extension', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Skull Crushers', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Dumbbell Overhead Extension', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Dumbbell Kickback', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Dips (Triceps-Focused)', primaryMuscle: MuscleGroup.triceps, secondaryMuscles: [MuscleGroup.chest], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Diamond Push-Ups', primaryMuscle: MuscleGroup.triceps, secondaryMuscles: [MuscleGroup.chest], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Machine Triceps Extension', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Rope Pushdown', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'JM Press', primaryMuscle: MuscleGroup.triceps, equipment: EquipmentType.barbell),
  ],

  MuscleGroup.quads: [
    ExerciseSeed(name: 'Barbell Back Squat', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.glutes, MuscleGroup.hamstrings], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Barbell Front Squat', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.core], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Leg Press', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Leg Extension', primaryMuscle: MuscleGroup.quads, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Walking Lunges', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Bulgarian Split Squat', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Goblet Squat', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Hack Squat', primaryMuscle: MuscleGroup.quads, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Step-Ups', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Sissy Squat', primaryMuscle: MuscleGroup.quads, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Smith Machine Squat', primaryMuscle: MuscleGroup.quads, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Bodyweight Squat', primaryMuscle: MuscleGroup.quads, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Zercher Squat', primaryMuscle: MuscleGroup.quads, secondaryMuscles: [MuscleGroup.core], equipment: EquipmentType.barbell),
  ],

  MuscleGroup.hamstrings: [
    ExerciseSeed(name: 'Romanian Deadlift', primaryMuscle: MuscleGroup.hamstrings, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Dumbbell Romanian Deadlift', primaryMuscle: MuscleGroup.hamstrings, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Lying Leg Curl', primaryMuscle: MuscleGroup.hamstrings, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Seated Leg Curl', primaryMuscle: MuscleGroup.hamstrings, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Good Mornings', primaryMuscle: MuscleGroup.hamstrings, secondaryMuscles: [MuscleGroup.back], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Nordic Hamstring Curl', primaryMuscle: MuscleGroup.hamstrings, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Single-Leg Romanian Deadlift', primaryMuscle: MuscleGroup.hamstrings, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Stiff-Leg Deadlift', primaryMuscle: MuscleGroup.hamstrings, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Glute-Ham Raise', primaryMuscle: MuscleGroup.hamstrings, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Cable Pull-Through', primaryMuscle: MuscleGroup.hamstrings, secondaryMuscles: [MuscleGroup.glutes], equipment: EquipmentType.cable),
  ],

  MuscleGroup.glutes: [
    ExerciseSeed(name: 'Barbell Hip Thrust', primaryMuscle: MuscleGroup.glutes, secondaryMuscles: [MuscleGroup.hamstrings], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Glute Bridge', primaryMuscle: MuscleGroup.glutes, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Dumbbell Hip Thrust', primaryMuscle: MuscleGroup.glutes, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Cable Kickback', primaryMuscle: MuscleGroup.glutes, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Sumo Deadlift', primaryMuscle: MuscleGroup.glutes, secondaryMuscles: [MuscleGroup.hamstrings, MuscleGroup.back], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Curtsy Lunge', primaryMuscle: MuscleGroup.glutes, secondaryMuscles: [MuscleGroup.quads], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Hip Abduction Machine', primaryMuscle: MuscleGroup.glutes, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Banded Lateral Walk', primaryMuscle: MuscleGroup.glutes, equipment: EquipmentType.resistanceBand),
    ExerciseSeed(name: 'Frog Pump', primaryMuscle: MuscleGroup.glutes, equipment: EquipmentType.bodyweight),
  ],

  MuscleGroup.calves: [
    ExerciseSeed(name: 'Standing Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Seated Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Barbell Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Dumbbell Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Leg Press Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Single-Leg Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Donkey Calf Raise', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Jump Rope', primaryMuscle: MuscleGroup.calves, equipment: EquipmentType.bodyweight),
  ],

  MuscleGroup.core: [
    ExerciseSeed(name: 'Plank', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Side Plank', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Hanging Leg Raise', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Cable Crunch', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Ab Wheel Rollout', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.other),
    ExerciseSeed(name: 'Russian Twist', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Bicycle Crunch', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Sit-Ups', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Weighted Sit-Ups', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Flutter Kicks', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Dead Bug', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Mountain Climbers', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Woodchopper', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.cable),
    ExerciseSeed(name: 'Decline Sit-Up', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'V-Ups', primaryMuscle: MuscleGroup.core, equipment: EquipmentType.bodyweight),
  ],

  MuscleGroup.fullBody: [
    ExerciseSeed(name: 'Burpees', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Kettlebell Swing', primaryMuscle: MuscleGroup.fullBody, secondaryMuscles: [MuscleGroup.glutes, MuscleGroup.hamstrings], equipment: EquipmentType.kettlebell),
    ExerciseSeed(name: 'Clean and Jerk', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Snatch', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Thruster', primaryMuscle: MuscleGroup.fullBody, secondaryMuscles: [MuscleGroup.quads, MuscleGroup.shoulders], equipment: EquipmentType.barbell),
    ExerciseSeed(name: 'Battle Ropes', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.other),
    ExerciseSeed(name: 'Rowing Machine', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Assault Bike', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Treadmill Run', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.machine),
    ExerciseSeed(name: 'Stationary Bike', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.machine),
    ExerciseSeed(name: "Farmer's Carry", primaryMuscle: MuscleGroup.fullBody, secondaryMuscles: [MuscleGroup.core], equipment: EquipmentType.dumbbell),
    ExerciseSeed(name: 'Sled Push', primaryMuscle: MuscleGroup.fullBody, secondaryMuscles: [MuscleGroup.quads], equipment: EquipmentType.other),
    ExerciseSeed(name: 'Box Jump', primaryMuscle: MuscleGroup.fullBody, secondaryMuscles: [MuscleGroup.quads, MuscleGroup.glutes], equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Jumping Jacks', primaryMuscle: MuscleGroup.fullBody, equipment: EquipmentType.bodyweight),
    ExerciseSeed(name: 'Turkish Get-Up', primaryMuscle: MuscleGroup.fullBody, secondaryMuscles: [MuscleGroup.core, MuscleGroup.shoulders], equipment: EquipmentType.kettlebell),
  ],
};

/// Flat list version (useful for search/autocomplete across all exercises).
List<ExerciseSeed> get allExercises =>
    exerciseDatabase.values.expand((list) => list).toList();
