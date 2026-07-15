import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';
import 'api_service.dart';

class AuthNotifier extends ChangeNotifier {
  AuthNotifier(this._api);

  static const _tokenKey = 'onemorerep-token';
  static const _userKey = 'onemorerep-user';

  final ApiService _api;

  AppUser? _user;
  String? _token;
  bool _isLoading = true;

  AppUser? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null && _user != null;

  Future<void> bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      _user = AppUser.fromJson(
        jsonDecode(userJson) as Map<String, dynamic>,
      );
    }

    if (_token == null) {
      _isLoading = false;
      notifyListeners();
      return;
    }

    try {
      _user = await _api.getMe(_token!);
      await prefs.setString(_userKey, jsonEncode(_user!.toJson()));
    } catch (_) {
      await logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    final response = await _api.login(email, password);
    await _persist(response.token, response.user);
  }

  Future<void> register(
    String name,
    String email,
    String password,
  ) async {
    final response = await _api.register(name, email, password);
    await _persist(response.token, response.user);
  }

  Future<void> deleteAccount() async {
    if (_token == null) throw ApiException('Not authenticated');
    await _api.deleteAccount(_token!);
    await logout();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    _token = null;
    _user = null;
    notifyListeners();
  }

  Future<void> _persist(String token, AppUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
    _token = token;
    _user = user;
    notifyListeners();
  }
}
