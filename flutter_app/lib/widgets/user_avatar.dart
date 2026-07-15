import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

class UserAvatar extends StatelessWidget {
  const UserAvatar({
    super.key,
    required this.name,
    this.avatarUrl,
    this.size = 40,
  });

  final String? name;
  final String? avatarUrl;
  final double size;

  String get _initials {
    final parts = (name ?? 'A').trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return 'A';
    if (parts.length == 1) {
      return parts.first.isNotEmpty ? parts.first[0].toUpperCase() : 'A';
    }
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget child;
    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      if (avatarUrl!.startsWith('data:')) {
        final bytes = base64Decode(avatarUrl!.split(',').last);
        child = Image.memory(bytes, fit: BoxFit.cover);
      } else {
        child = CachedNetworkImage(
          imageUrl: avatarUrl!,
          fit: BoxFit.cover,
          errorWidget: (_, _, _) => _fallback(isDark),
        );
      }
    } else {
      child = _fallback(isDark);
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(size * 0.28),
      child: SizedBox(width: size, height: size, child: child),
    );
  }

  Widget _fallback(bool isDark) {
    return ColoredBox(
      color: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFE5E5EA),
      child: Center(
        child: Text(
          _initials,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: size * 0.36,
          ),
        ),
      ),
    );
  }
}
