import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/auth_notifier.dart';
import '../services/theme_notifier.dart';
import '../services/tracker_notifier.dart';
import '../theme/app_theme.dart';
import '../widgets/user_avatar.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  var _deleting = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthNotifier>();
    final theme = context.watch<ThemeNotifier>();
    final sessions = context.watch<TrackerNotifier>().sessions;
    final user = auth.user;
    final firstName = user?.name.split(' ').first ?? 'Athlete';

    final completed = sessions.length;
    final minutes = completed > 0
        ? sessions.fold<int>(
            0,
            (sum, s) => sum + (s.exercises.length * 8).clamp(15, 999),
          )
        : 0;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
      children: [
        Row(
          children: [
            const Icon(Icons.person_outline, size: 20),
            const SizedBox(width: 8),
            Text(
              'PROFILE',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
                color: mutedColor(context),
                fontSize: 12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            UserAvatar(
              name: user?.name,
              avatarUrl: user?.avatarUrl,
              size: 72,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    firstName,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (user?.email != null)
                    Text(
                      user!.email,
                      style: TextStyle(color: mutedColor(context)),
                    ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            _miniStat(context, '$completed', 'Workouts'),
            _miniStat(context, '$minutes', 'Minutes'),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          decoration: BoxDecoration(
            color: surfaceColor(context),
            borderRadius: BorderRadius.circular(16),
          ),
          child: SwitchListTile(
            title: const Text('Dark mode'),
            secondary: Icon(
              theme.isDark ? Icons.dark_mode : Icons.light_mode,
            ),
            value: theme.isDark,
            onChanged: (_) => theme.toggle(),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            auth.logout();
            context.go('/login');
          },
          icon: const Icon(Icons.logout),
          label: const Text('Sign out'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(48),
          ),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _deleting ? null : () => _confirmDelete(context, auth),
          icon: const Icon(Icons.delete_outline, color: Colors.red),
          label: Text(
            _deleting ? 'Deleting…' : 'Delete account',
            style: const TextStyle(color: Colors.red),
          ),
        ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(_error!, style: const TextStyle(color: Colors.red)),
          ),
      ],
    );
  }

  Widget _miniStat(BuildContext context, String value, String label) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: surfaceColor(context),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text(label, style: TextStyle(color: mutedColor(context), fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, AuthNotifier auth) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete account?'),
        content: const Text('This permanently removes your account and data.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
        ],
      ),
    );

    if (ok != true || !mounted) return;

    setState(() {
      _deleting = true;
      _error = null;
    });

    try {
      await auth.deleteAccount();
      if (!context.mounted) return;
      context.go('/login');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }
}
