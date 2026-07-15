import 'package:flutter/material.dart';

class AppColors {
  static const islandBg = Color(0xFF1A1A1A);
  static const inactiveIcon = Color(0xFFA1A1A6);
}

class AppTheme {
  static ThemeData light() {
    const bg = Color(0xFFF0EEE6);
    const fg = Color(0xFF1A1A1A);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.light(
        surface: bg,
        onSurface: fg,
        primary: fg,
        onPrimary: bg,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bg,
        foregroundColor: fg,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFE8E6DE),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  static ThemeData dark() {
    const bg = Colors.black;
    const fg = Colors.white;
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.dark(
        surface: bg,
        onSurface: fg,
        primary: fg,
        onPrimary: bg,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bg,
        foregroundColor: fg,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1A1A1A),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

Color mutedColor(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFF8E8E93)
      : const Color(0xFF6B6962);
}

Color surfaceColor(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFF1C1C1E)
      : const Color(0xFFE8E6DE);
}
