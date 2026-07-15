class WorkoutVideoCategory {
  const WorkoutVideoCategory({
    required this.id,
    required this.label,
    required this.videoPath,
    required this.available,
  });

  final String id;
  final String label;
  final String videoPath;
  final bool available;

  factory WorkoutVideoCategory.fromJson(Map<String, dynamic> json) {
    return WorkoutVideoCategory(
      id: json['id'] as String,
      label: json['label'] as String,
      videoPath: json['videoPath'] as String,
      available: json['available'] as bool? ?? false,
    );
  }
}
