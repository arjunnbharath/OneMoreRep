class WorkoutExercise {
  const WorkoutExercise({
    required this.name,
    required this.duration,
    this.completed = false,
  });

  final String name;
  final String duration;
  final bool completed;

  factory WorkoutExercise.fromJson(Map<String, dynamic> json) {
    return WorkoutExercise(
      name: json['name'] as String,
      duration: json['duration'] as String,
      completed: json['completed'] as bool? ?? false,
    );
  }
}

class Workout {
  const Workout({
    required this.id,
    required this.title,
    required this.muscle,
    required this.stat,
    required this.rating,
    required this.duration,
    required this.image,
    required this.difficulty,
    required this.calories,
    required this.intensity,
    required this.exercises,
    this.shortTitle,
  });

  final String id;
  final String title;
  final String? shortTitle;
  final String muscle;
  final String stat;
  final double rating;
  final String duration;
  final String image;
  final String difficulty;
  final int calories;
  final String intensity;
  final List<WorkoutExercise> exercises;

  factory Workout.fromJson(Map<String, dynamic> json) {
    return Workout(
      id: json['id'] as String,
      title: json['title'] as String,
      shortTitle: json['shortTitle'] as String?,
      muscle: json['muscle'] as String,
      stat: json['stat'] as String,
      rating: (json['rating'] as num).toDouble(),
      duration: json['duration'] as String,
      image: json['image'] as String,
      difficulty: json['difficulty'] as String,
      calories: json['calories'] as int,
      intensity: json['intensity'] as String,
      exercises: (json['exercises'] as List<dynamic>)
          .map((e) => WorkoutExercise.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class HomeFilter {
  const HomeFilter({required this.id, required this.label});

  final String id;
  final String label;

  factory HomeFilter.fromJson(Map<String, dynamic> json) {
    return HomeFilter(
      id: json['id'] as String,
      label: json['label'] as String,
    );
  }
}

class WorkoutsBundle {
  const WorkoutsBundle({
    required this.workouts,
    required this.heroImage,
    required this.motivationImage,
    required this.homeFilters,
  });

  final List<Workout> workouts;
  final String heroImage;
  final String motivationImage;
  final List<HomeFilter> homeFilters;

  factory WorkoutsBundle.fromJson(Map<String, dynamic> json) {
    return WorkoutsBundle(
      workouts: (json['workouts'] as List<dynamic>)
          .map((w) => Workout.fromJson(w as Map<String, dynamic>))
          .toList(),
      heroImage: json['heroImage'] as String,
      motivationImage: json['motivationImage'] as String,
      homeFilters: (json['homeFilters'] as List<dynamic>)
          .map((f) => HomeFilter.fromJson(f as Map<String, dynamic>))
          .toList(),
    );
  }
}
