class TrackedSet {
  TrackedSet({
    required this.reps,
    this.weight,
    this.completed = false,
  });

  int reps;
  double? weight;
  bool completed;

  Map<String, dynamic> toJson() => {
        'reps': reps,
        'weight': weight,
        'completed': completed,
      };

  factory TrackedSet.fromJson(Map<String, dynamic> json) {
    return TrackedSet(
      reps: json['reps'] as int,
      weight: (json['weight'] as num?)?.toDouble(),
      completed: json['completed'] as bool? ?? false,
    );
  }
}

class TrackedExercise {
  TrackedExercise({required this.name, List<TrackedSet>? sets})
      : sets = sets ?? [];

  final String name;
  final List<TrackedSet> sets;

  Map<String, dynamic> toJson() => {
        'name': name,
        'sets': sets.map((s) => s.toJson()).toList(),
      };

  factory TrackedExercise.fromJson(Map<String, dynamic> json) {
    return TrackedExercise(
      name: json['name'] as String,
      sets: (json['sets'] as List<dynamic>?)
              ?.map((s) => TrackedSet.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class WorkoutSession {
  WorkoutSession({
    required this.id,
    required this.date,
    this.workoutTitle,
    this.startedAt,
    List<TrackedExercise>? exercises,
  }) : exercises = exercises ?? [];

  final String id;
  final String date;
  final String? workoutTitle;
  final String? startedAt;
  final List<TrackedExercise> exercises;

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date,
        'workoutTitle': workoutTitle,
        'startedAt': startedAt,
        'exercises': exercises.map((e) => e.toJson()).toList(),
      };

  factory WorkoutSession.fromJson(Map<String, dynamic> json) {
    return WorkoutSession(
      id: json['id'] as String,
      date: json['date'] as String,
      workoutTitle: json['workoutTitle'] as String?,
      startedAt: json['startedAt'] as String?,
      exercises: (json['exercises'] as List<dynamic>?)
              ?.map((e) => TrackedExercise.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
