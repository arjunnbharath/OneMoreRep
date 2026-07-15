import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../models/workout.dart';
import '../theme/app_theme.dart';

class WorkoutCard extends StatelessWidget {
  const WorkoutCard({
    super.key,
    required this.workout,
    required this.onTap,
    this.bookmarked = false,
    this.onBookmark,
  });

  final Workout workout;
  final VoidCallback onTap;
  final bool bookmarked;
  final VoidCallback? onBookmark;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: surfaceColor(context),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 10,
                  child: CachedNetworkImage(
                    imageUrl: workout.image,
                    fit: BoxFit.cover,
                    placeholder: (_, _) => ColoredBox(
                      color: surfaceColor(context),
                    ),
                  ),
                ),
                if (onBookmark != null)
                  Positioned(
                    top: 10,
                    right: 10,
                    child: IconButton(
                      onPressed: onBookmark,
                      icon: Icon(
                        bookmarked
                            ? Icons.bookmark
                            : Icons.bookmark_outline,
                        color: Colors.white,
                      ),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.black45,
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    workout.shortTitle ?? workout.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${workout.duration} · ${workout.difficulty}',
                    style: TextStyle(
                      fontSize: 13,
                      color: mutedColor(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.local_fire_department_outlined, size: 16),
                      const SizedBox(width: 4),
                      Text('${workout.calories} cal'),
                      const Spacer(),
                      const Icon(Icons.star_rounded, size: 16),
                      Text(workout.rating.toStringAsFixed(1)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
