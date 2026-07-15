import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

enum AppTab { home, workouts, tracker, profile }

class IslandBottomNav extends StatelessWidget {
  const IslandBottomNav({super.key, required this.location});

  final String location;

  AppTab get _active {
    if (location.startsWith('/tracker')) return AppTab.tracker;
    if (location.startsWith('/profile')) return AppTab.profile;
    if (location.contains('section=workouts')) return AppTab.workouts;
    return AppTab.home;
  }

  @override
  Widget build(BuildContext context) {
    final active = _active;
    final theme = Theme.of(context);
    final border = theme.dividerColor.withValues(alpha: 0.8);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(top: BorderSide(color: border)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              _item(
                context,
                icon: Icons.home_outlined,
                activeIcon: Icons.home_rounded,
                label: 'Home',
                selected: active == AppTab.home,
                onTap: () => context.go('/home'),
              ),
              _item(
                context,
                icon: Icons.fitness_center_outlined,
                activeIcon: Icons.fitness_center_rounded,
                label: 'Workouts',
                selected: active == AppTab.workouts,
                onTap: () => context.go('/home?section=workouts'),
              ),
              _item(
                context,
                icon: Icons.show_chart_outlined,
                activeIcon: Icons.show_chart_rounded,
                label: 'Progress',
                selected: active == AppTab.tracker,
                onTap: () => context.go('/tracker'),
              ),
              _item(
                context,
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profile',
                selected: active == AppTab.profile,
                onTap: () => context.go('/profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _item(
    BuildContext context, {
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final color = selected
        ? theme.colorScheme.onSurface
        : theme.colorScheme.onSurface.withValues(alpha: 0.45);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (selected)
              Container(
                height: 2,
                width: 24,
                margin: const EdgeInsets.only(bottom: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface,
                  borderRadius: BorderRadius.circular(999),
                ),
              )
            else
              const SizedBox(height: 6),
            Icon(selected ? activeIcon : icon, size: 22, color: color),
            const SizedBox(height: 2),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: color,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
