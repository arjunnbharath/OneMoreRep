import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/user.dart';

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class ApiService {
  Future<T> _request<T>(
    String path, {
    String method = 'GET',
    Map<String, String>? headers,
    Object? body,
    required T Function(Map<String, dynamic> json) parse,
  }) async {
    final uri = Uri.parse(AppConfig.apiUrl(path));
    final allHeaders = {
      'Content-Type': 'application/json',
      ...?headers,
    };
    http.Response res;

    try {
      switch (method.toUpperCase()) {
        case 'POST':
          res = await http
              .post(uri, headers: allHeaders, body: body == null ? null : jsonEncode(body))
              .timeout(const Duration(seconds: 20));
        case 'DELETE':
          res = await http
              .delete(uri, headers: allHeaders, body: body == null ? null : jsonEncode(body))
              .timeout(const Duration(seconds: 20));
        case 'PUT':
          res = await http
              .put(uri, headers: allHeaders, body: body == null ? null : jsonEncode(body))
              .timeout(const Duration(seconds: 20));
        case 'PATCH':
          res = await http
              .patch(uri, headers: allHeaders, body: body == null ? null : jsonEncode(body))
              .timeout(const Duration(seconds: 20));
        default:
          res = await http.get(uri, headers: allHeaders).timeout(const Duration(seconds: 20));
      }
    } catch (_) {
      throw ApiException(
        'Cannot reach the server. Check your connection or API_BASE_URL.',
      );
    }

    if (res.statusCode >= 400) {
      throw ApiException(_parseError(res));
    }

    return parse(jsonDecode(res.body) as Map<String, dynamic>);
  }

  String _parseError(http.Response res) {
    try {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final error = data['error'] as String?;
      if (error != null && error.isNotEmpty) return error;
    } catch (_) {}

    if (res.statusCode == 404) {
      return 'API not found. Run the backend locally or deploy API routes.';
    }

    return res.body.isNotEmpty
        ? res.body.substring(0, res.body.length.clamp(0, 200))
        : 'Request failed (${res.statusCode})';
  }

  Future<AuthResponse> login(String email, String password) {
    return _request(
      '/api/auth/login',
      method: 'POST',
      body: {'email': email, 'password': password},
      parse: AuthResponse.fromJson,
    );
  }

  Future<AuthResponse> register(
    String name,
    String email,
    String password,
  ) {
    return _request(
      '/api/auth/register',
      method: 'POST',
      body: {
        'name': name,
        'email': email,
        'password': password,
      },
      parse: AuthResponse.fromJson,
    );
  }

  Future<AppUser> getMe(String token) async {
    final data = await _request(
      '/api/auth/me',
      headers: {'Authorization': 'Bearer $token'},
      parse: (json) => json,
    );
    return AppUser.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<void> deleteAccount(String token) async {
    await _request(
      '/api/auth/delete',
      method: 'DELETE',
      headers: {'Authorization': 'Bearer $token'},
      parse: (_) => {},
    );
  }
}
