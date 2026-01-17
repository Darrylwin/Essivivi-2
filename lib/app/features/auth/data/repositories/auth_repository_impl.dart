import 'package:dartz/dartz.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../../core/error/failures.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/user_model.dart';

/// Implementation of AuthRepository
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SharedPreferences sharedPreferences;

  // Storage keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.sharedPreferences,
  });

  @override
  Future<Either<Failure, User>> login({
    required String identifier,
    required String password,
  }) async {
    try {
      // Call remote data source
      final result = await remoteDataSource.login(
        identifier: identifier,
        password: password,
      );

      final user = result['user'] as UserModel;
      final token = result['token'] as String;

      // Save token and user data locally
      await _saveAuthData(token: token, user: user);

      return Right(user);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      // Call remote logout (optional)
      await remoteDataSource.logout();

      // Clear local storage
      await sharedPreferences.remove(_tokenKey);
      await sharedPreferences.remove(_userKey);

      return const Right(null);
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      final userJson = sharedPreferences.getString(_userKey);

      if (userJson == null) {
        return const Left(UnauthorizedFailure('Aucun utilisateur connecté'));
      }

      final userMap = json.decode(userJson) as Map<String, dynamic>;
      final user = UserModel.fromJson(userMap);

      return Right(user);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> isLoggedIn() async {
    try {
      final token = sharedPreferences.getString(_tokenKey);
      return Right(token != null && token.isNotEmpty);
    } catch (e) {
      return const Right(false);
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  /// Save auth data to local storage
  Future<void> _saveAuthData({
    required String token,
    required UserModel user,
  }) async {
    await sharedPreferences.setString(_tokenKey, token);
    await sharedPreferences.setString(_userKey, json.encode(user.toJson()));
  }

  /// Map exceptions to appropriate Failure types
  Failure _mapExceptionToFailure(Exception exception) {
    final message = exception.toString().replaceAll('Exception: ', '');

    if (message.contains('Identifiants invalides')) {
      return InvalidCredentialsFailure(message);
    } else if (message.contains('connexion internet')) {
      return NetworkFailure(message);
    } else if (message.contains('expiré')) {
      return TimeoutFailure(message);
    } else if (message.contains('401')) {
      return const UnauthorizedFailure();
    } else {
      return ServerFailure(message);
    }
  }
}
