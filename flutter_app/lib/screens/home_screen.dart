import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/app_data.dart';
import '../services/auth_notifier.dart';
import '../services/tracker_notifier.dart';
import '../theme/app_theme.dart';
import '../widgets/user_avatar.dart';
import '../widgets/workout_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.scrollToWorkouts = false});

  final bool scrollToWorkouts;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _workoutsKey = GlobalKey();
  final _search = TextEditingController();
  var _filter = 'all';
  final _bookmarks = <String>{};

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
    if (widget.scrollToWorkouts) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final ctx = _workoutsKey.currentContext;
        if (ctx != null) {
          Scrollable.ensureVisible(
            ctx,
            duration: const Duration(milliseconds: 400),
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _loadBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('onemorerep-bookmarks') ?? [];
    setState(() => _bookmarks..clear()..addAll(list));
  }

  Future<void> _toggleBookmark(String id) async {
    setState(() {
      if (_bookmarks.contains(id)) {
        _bookmarks.remove(id);
      } else {
        _bookmarks.add(id);
      }
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('onemorerep-bookmarks', _bookmarks.toList());
  }

  int _computeStreak(List<String> dates) {
    if (dates.isEmpty) return 0;
    final unique = dates.map((d) => d.substring(0, 10)).toSet().toList()..sort();
    unique.sort((a, b) => b.compareTo(a));
    var streak = 0;
    final today = DateTime.now();
    for (var i = 0; i < unique.length; i++) {
      final expected = today.subtract(Duration(days: i));
      final key =
          '${expected.year.toString().padLeft(4, '0')}-${expected.month.toString().padLeft(2, '0')}-${expected.day.toString().padLeft(2, '0')}';
      if (unique.contains(key)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  @override
  Widget build(BuildContext context) {
    final bundle = AppData.workouts;
    final user = context.watch<AuthNotifier>().user;
    final sessions = context.watch<TrackerNotifier>().sessions;
    final firstName = user?.name.split(' ').first ?? 'Athlete';

    final completed = sessions.length;
    final minutes = completed > 0
        ? sessions.fold<int>(
            0,
            (sum, s) => sum + (s.exercises.length * 8).clamp(15, 999),
          )
        : 48;
    final calories = completed > 0 ? (minutes * 10.8).round() : 520;
    final streak =
        _computeStreak(sessions.map((s) => s.date).toList()).clamp(0, 999);
    final displayStreak = streak == 0 ? 7 : streak;

    var workouts = bundle.workouts;
    if (_filter != 'all') {
      workouts = workouts.where((w) => w.muscle == _filter).toList();
    }
    final q = _search.text.trim().toLowerCase();
    if (q.isNotEmpty) {
      workouts = workouts
          .where(
            (w) =>
                w.title.toLowerCase().contains(q) ||
                (w.shortTitle ?? '').toLowerCase().contains(q) ||
                w.muscle.contains(q),
          )
          .toList();
    }

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Stack(
            children: [
              SizedBox(
                height: 320,
                width: double.infinity,
                child: CachedNetworkImage(
                  imageUrl: bundle.heroImage,
                  fit: BoxFit.cover,
                ),
              ),
              Container(
                height: 320,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Theme.of(context).scaffoldBackgroundColor.withValues(alpha: 0.35),
                      Theme.of(context).scaffoldBackgroundColor,
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.fitness_center_rounded, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'ONEMOREREP',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2,
                            color: mutedColor(context),
                            fontSize: 12,
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () => context.go('/profile'),
                          child: UserAvatar(
                            name: user?.name,
                            avatarUrl: user?.avatarUrl,
                            size: 36,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),
                    Text('Hello, $firstName 👋',
                        style: TextStyle(color: mutedColor(context))),
                    const SizedBox(height: 8),
                    const Text(
                      "Let's crush your workout",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Discipline today, strength tomorrow.',
                      style: TextStyle(color: mutedColor(context)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverToBoxAdapter(
            child: Row(
              children: [
                _statTile(context, Icons.local_fire_department_outlined, '$calories', 'Calories'),
                _statTile(context, Icons.check_circle_outline, '${completed == 0 ? 1 : completed}', 'Workouts'),
                _statTile(context, Icons.schedule, '$minutes', 'Minutes'),
                _statTile(context, Icons.emoji_events_outlined, '$displayStreak', 'Streak'),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
          sliver: SliverToBoxAdapter(
            child: TextField(
              controller: _search,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'Search workouts',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverToBoxAdapter(
            child: SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: bundle.homeFilters.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final filter = bundle.homeFilters[index];
                  final selected = _filter == filter.id;
                  return ChoiceChip(
                    label: Text(filter.label),
                    selected: selected,
                    onSelected: (_) => setState(() => _filter = filter.id),
                  );
                },
              ),
            ),
          ),
        ),
        SliverPadding(
          key: _workoutsKey,
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 14,
              crossAxisSpacing: 14,
              childAspectRatio: 0.72,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final workout = workouts[index];
                return WorkoutCard(
                  workout: workout,
                  bookmarked: _bookmarks.contains(workout.id),
                  onBookmark: () => _toggleBookmark(workout.id),
                  onTap: () => context.push('/workout/${workout.id}'),
                );
              },
              childCount: workouts.length,
            ),
          ),
        ),
      ],
    );
  }

  Widget _statTile(
    BuildContext context,
    IconData icon,
    String value,
    String label,
  ) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: surfaceColor(context),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
            Text(label, style: TextStyle(fontSize: 11, color: mutedColor(context))),
          ],
        ),
      ),
    );
  }
}
