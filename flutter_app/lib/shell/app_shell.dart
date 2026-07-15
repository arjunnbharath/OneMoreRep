import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/island_bottom_nav.dart';

class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final hideNav = location.contains('/workout/');

    return Scaffold(
      body: child,
      bottomNavigationBar:
          hideNav ? null : IslandBottomNav(location: location),
    );
  }
}
