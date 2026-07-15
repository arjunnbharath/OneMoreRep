import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'data/app_data.dart';
import 'router/app_router.dart';
import 'services/api_service.dart';
import 'services/auth_notifier.dart';
import 'services/theme_notifier.dart';
import 'services/tracker_notifier.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppData.load();

  final api = ApiService();
  final auth = AuthNotifier(api);
  final theme = ThemeNotifier();
  final tracker = TrackerNotifier();

  await Future.wait([
    auth.bootstrap(),
    theme.load(),
    tracker.load(),
  ]);

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>.value(value: api),
        ChangeNotifierProvider<AuthNotifier>.value(value: auth),
        ChangeNotifierProvider<ThemeNotifier>.value(value: theme),
        ChangeNotifierProvider<TrackerNotifier>.value(value: tracker),
      ],
      child: OneMoreRepApp(auth: auth, theme: theme),
    ),
  );
}

class OneMoreRepApp extends StatefulWidget {
  const OneMoreRepApp({
    super.key,
    required this.auth,
    required this.theme,
  });

  final AuthNotifier auth;
  final ThemeNotifier theme;

  @override
  State<OneMoreRepApp> createState() => _OneMoreRepAppState();
}

class _OneMoreRepAppState extends State<OneMoreRepApp> {
  late final router = createRouter(widget.auth);

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.theme,
      builder: (context, _) {
        return MaterialApp.router(
          title: 'OneMoreRep',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light(),
          darkTheme: AppTheme.dark(),
          themeMode: widget.theme.mode == ThemeMode.system
              ? ThemeMode.system
              : widget.theme.mode,
          routerConfig: router,
        );
      },
    );
  }
}
