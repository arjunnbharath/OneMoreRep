type ExerciseContent = {
  description: string
  steps: string[]
  tips: string[]
}

export const chestExerciseContent: Record<string, ExerciseContent> = {
  'barbell-bench-press': {
    description:
      'A compound pressing movement that builds overall chest, shoulder, and triceps strength on a flat bench.',
    steps: [
      'Lie on a flat bench with eyes under the bar, feet flat on the floor, and shoulder blades pulled back and down.',
      'Grip the bar slightly wider than shoulder width, unrack it, and hold it over your mid-chest with straight wrists.',
      'Lower the bar under control to your mid-chest, keeping elbows at roughly a 45–75° angle from your torso.',
      'Press the bar up and slightly back over your shoulders until your arms are extended without locking out harshly.',
    ],
    tips: [
      'Keep your glutes and upper back on the bench — don’t lift your chest off the pad to cheat the rep.',
      'Use a spotter or safety bars when lifting heavy.',
      'Exhale as you press up; inhale as you lower.',
    ],
  },
  'incline-dumbbell-bench-press': {
    description:
      'An incline press that emphasizes the upper chest and front delts using dumbbells for a natural range of motion.',
    steps: [
      'Set the bench to 30–45° and sit with a dumbbell on each knee.',
      'Kick the dumbbells up as you lie back, holding them at shoulder height with palms facing forward.',
      'Press the dumbbells up until your arms are extended, without banging them together at the top.',
      'Lower slowly until the dumbbells reach outer-chest level with elbows slightly below the bench.',
    ],
    tips: [
      'Keep your shoulder blades pinned to the bench throughout the set.',
      'Don’t set the incline too steep or the shoulders will take over.',
      'Use a controlled 2–3 second lowering phase for better muscle tension.',
    ],
  },
  'pec-deck': {
    description:
      'A machine fly that isolates the chest by bringing your arms together in a fixed arc with constant tension.',
    steps: [
      'Adjust the seat so your upper arms are parallel to the floor when your elbows are on the pads.',
      'Place your forearms against the pads, grip the handles lightly, and sit tall with chest up.',
      'Squeeze the pads together in front of your chest in a smooth arc, focusing on pinching your pecs.',
      'Return slowly to the start until you feel a stretch in the chest — don’t let the weight stack slam.',
    ],
    tips: [
      'Keep a slight bend in your elbows; don’t straighten your arms fully at the top.',
      'Avoid shrugging your shoulders — keep them down and back.',
      'Pause for 1 second at peak contraction for a stronger chest squeeze.',
    ],
  },
  'cable-crossover': {
    description:
      'A cable fly that keeps tension on the chest through the full range, great for inner-chest squeeze and definition.',
    steps: [
      'Set both pulleys above shoulder height, grab the handles, and step forward into a staggered stance.',
      'Lean slightly forward with a soft bend in your elbows and arms wide in a fly position.',
      'Pull the handles down and together in a wide arc until they meet in front of your lower chest.',
      'Control the return until your arms are stretched back without letting your shoulders roll forward.',
    ],
    tips: [
      'High pulleys target lower chest; low pulleys target upper chest — adjust based on your goal.',
      'Keep your core braced and torso stable — don’t swing your body.',
      'Squeeze your chest hard at the bottom of each rep.',
    ],
  },
  'incline-barbell-bench-press': {
    description:
      'An incline barbell press that targets the upper chest and anterior deltoids with a fixed bar path.',
    steps: [
      'Set the bench to 30–45° and position yourself so the bar lines up over your upper chest.',
      'Grip the bar slightly wider than shoulders, unrack, and hold it over your upper chest/shoulders.',
      'Lower the bar to your upper chest or lower collarbone with elbows at about 45° from your body.',
      'Drive the bar up and slightly back to the starting position with steady control.',
    ],
    tips: [
      'Use a spotter when training heavy on incline — the bar path is less forgiving than flat bench.',
      'Avoid flaring elbows straight out to the sides to protect your shoulders.',
      'Keep your feet planted and core tight for a stable base.',
    ],
  },
  'dumbbell-bench-press': {
    description:
      'A flat dumbbell press that allows each arm to move independently, improving balance and chest activation.',
    steps: [
      'Sit on a flat bench with dumbbells on your knees, then lie back and position them at chest level.',
      'Press the dumbbells up until your arms are extended, keeping wrists stacked over elbows.',
      'Lower the dumbbells out to the sides until you feel a chest stretch, elbows at roughly 45°.',
      'Press back up, imagining you’re pushing your chest together as the weights rise.',
    ],
    tips: [
      'Don’t let the dumbbells drift too wide on the way down — that stresses the shoulders.',
      'Touch dumbbells lightly at the top optional; constant tension works well too.',
      'Start with moderate weight to master the balance before going heavy.',
    ],
  },
  'dumbbell-fly': {
    description:
      'An isolation fly on a flat bench that stretches and contracts the chest through a wide arcing motion.',
    steps: [
      'Lie on a flat bench holding dumbbells above your chest with palms facing each other and a slight elbow bend.',
      'Open your arms in a wide arc, lowering the dumbbells until you feel a stretch across your chest.',
      'Keep the same fixed elbow angle throughout — don’t bend and extend at the elbow.',
      'Squeeze your chest to bring the dumbbells back together above your chest in the same arc.',
    ],
    tips: [
      'Use lighter weight than you press — this is an isolation move, not a press.',
      'Stop lowering when your upper arms are parallel to the floor or slightly below.',
      'Focus on the stretch at the bottom and the squeeze at the top.',
    ],
  },
  'incline-dumbbell-fly': {
    description:
      'An incline fly that emphasizes the upper chest and clavicular head of the pectoralis major.',
    steps: [
      'Set the bench to 30–45° and hold dumbbells above your upper chest with palms facing each other.',
      'Lower the dumbbells out to the sides in a wide arc, maintaining a slight bend in your elbows.',
      'Go down until you feel a stretch in your upper chest without dropping your shoulders.',
      'Contract your chest to bring the dumbbells back together over your upper chest.',
    ],
    tips: [
      'Keep your shoulder blades retracted against the bench.',
      'A moderate incline (30°) hits upper chest best; steeper angles shift work to shoulders.',
      'Move slowly — momentum reduces chest activation on fly movements.',
    ],
  },
  'chest-press-machine': {
    description:
      'A guided machine press that lets you push heavy with a stable path, ideal for beginners and high-rep chest work.',
    steps: [
      'Adjust the seat so the handles align with your mid-chest when your arms are back.',
      'Grip the handles, place your feet flat on the floor, and press your back firmly into the pad.',
      'Push the handles forward until your arms are extended without locking elbows aggressively.',
      'Return under control until your elbows are just behind your torso, then press again.',
    ],
    tips: [
      'Don’t let your lower back arch off the pad — keep your core engaged.',
      'Use a full range of motion; partial reps reduce chest involvement.',
      'Great for drop sets and burnout sets since no spotter is needed.',
    ],
  },
  'barbell-declined-bench-press': {
    description:
      'A decline barbell press that shifts emphasis to the lower chest and allows you to handle heavy loads.',
    steps: [
      'Secure your legs in the decline bench pads and lie back with eyes under the bar.',
      'Grip the bar slightly wider than shoulders, unrack, and hold it over your lower chest.',
      'Lower the bar to your lower chest with controlled elbows at about 45° from your torso.',
      'Press the bar up in a straight line back to the start, squeezing your chest at the top.',
    ],
    tips: [
      'Have a spotter help unrack and rerack — decline bench can be awkward alone.',
      'Don’t bounce the bar off your chest.',
      'Keep your shoulder blades pinched together for shoulder safety.',
    ],
  },
  'dumbbell-declined-bench-press': {
    description:
      'A decline dumbbell press targeting the lower chest with independent arm movement and a deep stretch.',
    steps: [
      'Secure yourself on a decline bench with a dumbbell on each knee.',
      'Kick the weights up as you lie back, holding them at lower-chest level.',
      'Press the dumbbells up until arms are extended, palms facing forward.',
      'Lower under control until dumbbells reach the sides of your lower chest.',
    ],
    tips: [
      'Start lighter than flat bench — decline angle changes leverage and balance.',
      'Keep your wrists straight and stacked over your elbows.',
      'Move the dumbbells in a slight arc, not straight up and down.',
    ],
  },
  'push-ups': {
    description:
      'A bodyweight pressing exercise that trains the chest, shoulders, and triceps with no equipment needed.',
    steps: [
      'Start in a high plank with hands slightly wider than shoulders and body in a straight line from head to heels.',
      'Brace your core and glutes, then bend your elbows to lower your chest toward the floor.',
      'Go down until your chest nearly touches the ground or upper arms are parallel to the floor.',
      'Push through your palms to extend your arms and return to the start without sagging your hips.',
    ],
    tips: [
      'Keep your elbows at about 45° from your body, not flared straight out.',
      'Elevate your hands on a bench to make it easier; elevate your feet to make it harder.',
      'Exhale on the way up; keep your neck neutral by looking slightly ahead of your hands.',
    ],
  },
}
