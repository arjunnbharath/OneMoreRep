import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../screens/login_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/signup_screen.dart';
import '../screens/splash_screen.dart';
import '../screens/tracker_screen.dart';
import '../screens/workout_detail_screen.dart';
import '../services/auth_notifier.dart';
import '../shell/app_shell.dart';

GoRouter createRouter(AuthNotifier auth) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: auth,
    redirect: (context, state) {
      if (auth.isLoading) return null;

      final path = state.uri.path;
      final isAuthRoute =
          path == '/' || path == '/login' || path == '/signup';
      final loggedIn = auth.isAuthenticated;

      if (!loggedIn && !isAuthRoute) return '/login';
      if (loggedIn && (path == '/login' || path == '/signup' || path == '/')) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (_, _) => const SignupScreen()),
      ShellRoute(
        builder: (_, _, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (_, state) => HomeScreen(
              scrollToWorkouts: state.uri.queryParameters['section'] == 'workouts',
            ),
          ),
          GoRoute(
            path: '/tracker',
            builder: (_, _) => const TrackerScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (_, _) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/workout/:id',
        builder: (_, state) => WorkoutDetailScreen(
          workoutId: state.pathParameters['id']!,
        ),
      ),
    ],
  );
}
