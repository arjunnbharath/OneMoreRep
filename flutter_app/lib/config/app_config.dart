/// Build-time configuration via `--dart-define`.
///
/// Example:
/// `flutter run -d windows --dart-define=API_BASE_URL=http://10.0.2.2:3001 --dart-define=ASSET_BASE_URL=http://10.0.2.2:5173`
class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001',
  );

  /// Host serving workout videos (Vite dev server or Vercel deployment).
  static const assetBaseUrl = String.fromEnvironment(
    'ASSET_BASE_URL',
    defaultValue: 'http://localhost:5173',
  );

  static String apiUrl(String path) {
    final base = apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    return '$base$path';
  }

  static String assetUrl(String path) {
    final base = assetBaseUrl.replaceAll(RegExp(r'/$'), '');
  final normalized = path.startsWith('/') ? path : '/$path';
    return '$base$normalized';
  }
}
