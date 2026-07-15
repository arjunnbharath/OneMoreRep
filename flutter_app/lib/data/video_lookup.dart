import '../models/video_category.dart';
import 'app_data.dart';

const _aliases = <String, String>{
  'barbell curl': 'barbell-biceps-curl',
  'bicep curl': 'barbell-biceps-curl',
  'push ups': 'push-up',
  'pushups': 'push-up',
  'pull ups': 'pull-up',
  'pullups': 'pull-up',
  'bench press': 'bench-press',
  'flat bench press': 'bench-press',
  'incline bench press': 'incline-bench-press',
  'shoulder press': 'shoulder-press',
  'overhead press': 'shoulder-press',
  'lateral raise': 'lateral-raise',
  'lat pulldown': 'lat-pulldown',
  'hammer curl': 'hammer-curl',
  'tricep pushdown': 'tricep-pushdown',
  'barbell squat': 'squat',
  'leg extension': 'leg-extension',
  'plank hold': 'plank',
  'plank': 'plank',
  'russian twists': 'russian-twist',
  'deadlift': 'deadlift',
  'romanian deadlift': 'romanian-deadlift',
  'hip thrust': 'hip-thrust',
  'pec deck': 'chest-fly-machine',
  'barbell row': 't-bar-row',
  'seated cable row': 't-bar-row',
};

String _normalize(String text) {
  return text
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), ' ')
      .trim();
}

WorkoutVideoCategory? getVideoCategoryById(String id) {
  for (final category in AppData.videos) {
    if (category.id == id) return category;
  }
  return null;
}

int _scoreMatch(String exerciseName, WorkoutVideoCategory category) {
  final exercise = _normalize(exerciseName);
  final label = _normalize(category.label);

  if (exercise == label) return 100;
  if (exercise.contains(label) || label.contains(exercise)) return 80;

  final exerciseTokens = exercise.split(' ').toSet();
  final overlap =
      label.split(' ').where((t) => exerciseTokens.contains(t)).length;
  return overlap * 10;
}

WorkoutVideoCategory? findVideoForExercise(String exerciseName) {
  final normalized = _normalize(exerciseName);
  final aliasId = _aliases[normalized];
  if (aliasId != null) {
    final match = getVideoCategoryById(aliasId);
    if (match != null) return match;
  }

  WorkoutVideoCategory? best;
  var bestScore = 0;

  for (final category in AppData.videos) {
    final score = _scoreMatch(exerciseName, category);
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return bestScore >= 30 ? best : null;
}
