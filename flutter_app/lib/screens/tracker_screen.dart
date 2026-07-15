import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/tracker.dart';
import '../services/tracker_notifier.dart';
import '../theme/app_theme.dart';

class TrackerScreen extends StatefulWidget {
  const TrackerScreen({super.key});

  @override
  State<TrackerScreen> createState() => _TrackerScreenState();
}

class _TrackerScreenState extends State<TrackerScreen> {
  final _exerciseName = TextEditingController();

  @override
  void dispose() {
    _exerciseName.dispose();
    super.dispose();
  }

  void _addExercise(TrackerNotifier tracker) {
    final name = _exerciseName.text.trim();
    if (name.isEmpty) return;
    tracker.addExercise(name);
    tracker.addSet(tracker.activeSession!.exercises.length - 1);
    _exerciseName.clear();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final tracker = context.watch<TrackerNotifier>();
    final session = tracker.activeSession;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
      children: [
        Row(
          children: [
            const Icon(Icons.show_chart_rounded, size: 20),
            const SizedBox(width: 8),
            Text(
              'PROGRESS',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
                color: mutedColor(context),
                fontSize: 12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        const Text(
          'Workout tracker',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 20),
        if (session == null) ...[
          FilledButton(
            onPressed: tracker.startSession,
            child: const Text('Start empty session'),
          ),
          const SizedBox(height: 24),
          Text(
            'Recent sessions',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          if (tracker.sessions.isEmpty)
            Text('No sessions yet.', style: TextStyle(color: mutedColor(context)))
          else
            ...tracker.sessions.map((s) => _sessionTile(context, tracker, s)),
        ] else ...[
          Text(
            session.workoutTitle ?? 'Active session',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _exerciseName,
                  decoration: const InputDecoration(
                    hintText: 'Exercise name',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: () => _addExercise(tracker),
                icon: const Icon(Icons.add),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...List.generate(session.exercises.length, (i) {
            final exercise = session.exercises[i];
            return _exerciseCard(context, tracker, i, exercise);
          }),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: tracker.finishSession,
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
            ),
            child: const Text('Finish session'),
          ),
        ],
      ],
    );
  }

  Widget _sessionTile(
    BuildContext context,
    TrackerNotifier tracker,
    WorkoutSession session,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
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
                  session.workoutTitle ?? 'Workout',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  '${session.exercises.length} exercises',
                  style: TextStyle(color: mutedColor(context), fontSize: 13),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => tracker.deleteSession(session.id),
            icon: const Icon(Icons.delete_outline),
          ),
        ],
      ),
    );
  }

  Widget _exerciseCard(
    BuildContext context,
    TrackerNotifier tracker,
    int exerciseIndex,
    TrackedExercise exercise,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surfaceColor(context),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(exercise.name, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ...List.generate(exercise.sets.length, (setIndex) {
            final set = exercise.sets[setIndex];
            return CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: set.completed,
              onChanged: (_) =>
                  tracker.toggleSetComplete(exerciseIndex, setIndex),
              title: Text('Set ${setIndex + 1}: ${set.reps} reps'),
            );
          }),
          TextButton.icon(
            onPressed: () {
              tracker.addSet(exerciseIndex);
              setState(() {});
            },
            icon: const Icon(Icons.add),
            label: const Text('Add set'),
          ),
        ],
      ),
    );
  }
}
