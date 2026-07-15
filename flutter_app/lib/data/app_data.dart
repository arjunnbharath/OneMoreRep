import 'dart:convert';

import 'package:flutter/services.dart';

import '../models/video_category.dart';
import '../models/workout.dart';

class AppData {
  AppData._();

  static WorkoutsBundle? _bundle;
  static List<WorkoutVideoCategory> _videos = [];

  static WorkoutsBundle get workouts {
    final bundle = _bundle;
    if (bundle == null) {
      throw StateError('AppData not loaded. Call AppData.load() first.');
    }
    return bundle;
  }

  static List<WorkoutVideoCategory> get videos => _videos;

  static Future<void> load() async {
    final workoutsRaw =
        await rootBundle.loadString('assets/workouts.json');
    _bundle = WorkoutsBundle.fromJson(
      jsonDecode(workoutsRaw) as Map<String, dynamic>,
    );

    final manifestRaw =
        await rootBundle.loadString('assets/workout-videos-manifest.json');
    final manifest = jsonDecode(manifestRaw) as Map<String, dynamic>;
    _videos = (manifest['categories'] as List<dynamic>)
        .map((c) => WorkoutVideoCategory.fromJson(c as Map<String, dynamic>))
        .where((c) => c.available)
        .toList();
  }
}
