import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/app_data.dart';
import '../data/video_lookup.dart';
import '../services/tracker_notifier.dart';
import '../theme/app_theme.dart';
import '../widgets/exercise_video_player.dart';

class WorkoutDetailScreen extends StatelessWidget {
  const WorkoutDetailScreen({super.key, required this.workoutId});

  final String workoutId;

  @override
  Widget build(BuildContext context) {
    final matches =
        AppData.workouts.workouts.where((w) => w.id == workoutId);
    if (matches.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('Workout not found')),
      );
    }
    final workout = matches.first;

    final previewVideo = workout.exercises.isNotEmpty
        ? findVideoForExercise(workout.exercises.first.name)
        : null;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 260,
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => context.pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: CachedNetworkImage(
                imageUrl: workout.image,
                fit: BoxFit.cover,
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Text(
                  workout.title,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${workout.duration} · ${workout.difficulty} · ${workout.calories} cal',
                  style: TextStyle(color: mutedColor(context)),
                ),
                const SizedBox(height: 20),
                if (previewVideo != null) ...[
                  ExerciseVideoPlayer(videoPath: previewVideo.videoPath),
                  const SizedBox(height: 8),
                  Text(
                    previewVideo.label,
                    style: TextStyle(color: mutedColor(context), fontSize: 13),
                  ),
                  const SizedBox(height: 20),
                ],
                FilledButton(
                  onPressed: () {
                    context.read<TrackerNotifier>().startSession(
                          workoutTitle: workout.title,
                        );
                    context.go('/tracker');
                  },
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text('Start workout'),
                ),
                const SizedBox(height: 24),
                Text(
                  'Exercises',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 12),
                ...workout.exercises.map((exercise) {
                  final video = findVideoForExercise(exercise.name);
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: surfaceColor(context),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                exercise.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                exercise.duration,
                                style: TextStyle(
                                  color: mutedColor(context),
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (video != null)
                          const Icon(Icons.play_circle_outline),
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}
