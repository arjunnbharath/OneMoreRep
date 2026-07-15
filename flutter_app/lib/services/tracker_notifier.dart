import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/tracker.dart';

class TrackerNotifier extends ChangeNotifier {
  static const _key = 'onemorerep-sessions';

  final List<WorkoutSession> _sessions = [];
  WorkoutSession? _activeSession;

  List<WorkoutSession> get sessions => List.unmodifiable(_sessions);
  WorkoutSession? get activeSession => _activeSession;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return;

    final list = jsonDecode(raw) as List<dynamic>;
    _sessions
      ..clear()
      ..addAll(
        list.map((e) => WorkoutSession.fromJson(e as Map<String, dynamic>)),
      );
    notifyListeners();
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(_sessions.map((s) => s.toJson()).toList()),
    );
  }

  void startSession({String? workoutTitle}) {
    final now = DateTime.now().toIso8601String();
    _activeSession = WorkoutSession(
      id: now,
      date: now,
      workoutTitle: workoutTitle,
      startedAt: now,
    );
    notifyListeners();
  }

  void addExercise(String name) {
    final session = _activeSession;
    if (session == null) return;
    session.exercises.add(TrackedExercise(name: name));
    notifyListeners();
    _save();
  }

  void addSet(int exerciseIndex, {int reps = 10, double? weight}) {
    final session = _activeSession;
    if (session == null || exerciseIndex >= session.exercises.length) return;
    session.exercises[exerciseIndex].sets.add(
          TrackedSet(reps: reps, weight: weight),
        );
    notifyListeners();
    _save();
  }

  void toggleSetComplete(int exerciseIndex, int setIndex) {
    final session = _activeSession;
    if (session == null || exerciseIndex >= session.exercises.length) return;
    final sets = session.exercises[exerciseIndex].sets;
    if (setIndex >= sets.length) return;
    sets[setIndex].completed = !sets[setIndex].completed;
    notifyListeners();
    _save();
  }

  void finishSession() {
    final session = _activeSession;
    if (session == null) return;
    _sessions.insert(0, session);
    _activeSession = null;
    notifyListeners();
    _save();
  }

  void deleteSession(String id) {
    _sessions.removeWhere((s) => s.id == id);
    notifyListeners();
    _save();
  }
}
