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
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user_data';
  static const String _userTypeKey = 'user_type';

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.sharedPreferences,
  });

  @override
  Future<Either<Failure, String>> login({
    required String email,
    required String motDePasse,
  }) async {
    try {
      final result = await remoteDataSource.login(
        email: email,
        motDePasse: motDePasse,
      );

      // Sauvegarder le user_type et l'email pour la vérification OTP
      await sharedPreferences.setString('pending_login_email', result['email']);
      await sharedPreferences.setString('pending_login_user_type', result['user_type']);

      return Right(result['email'] as String);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final result = await remoteDataSource.verifyOtp(
        email: email,
        otp: otp,
      );

      final token = result['token'] as String;
      final refreshToken = result['refresh'] as String;
      final userType = result['user_type'] as String;
      final userJson = result['user'] as Map<String, dynamic>;

      // Créer le UserModel
      final user = UserModel.fromJson(userJson, userType);

      // Sauvegarder les tokens et user data
      await _saveAuthData(
        token: token,
        refreshToken: refreshToken,
        user: user,
      );

      // Nettoyer les données de login en attente
      await sharedPreferences.remove('pending_login_email');
      await sharedPreferences.remove('pending_login_user_type');

      return Right({
        'user': user,
        'tokens': {
          'token': token,
          'refresh': refreshToken,
        },
      });
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, String>> register({
    required String nomPointVente,
    required String nomResponsable,
    required String telephone,
    required String email,
    required String motDePasse,
    required String adresse,
    double? latitude,
    double? longitude,
    required String typeClient,
  }) async {
    try {
      final result = await remoteDataSource.register(
        nomPointVente: nomPointVente,
        nomResponsable: nomResponsable,
        telephone: telephone,
        email: email,
        motDePasse: motDePasse,
        adresse: adresse,
        latitude: latitude,
        longitude: longitude,
        typeClient: typeClient,
      );

      // Sauvegarder l'email pour la vérification OTP
      await sharedPreferences.setString('pending_registration_email', result['email']);
      await sharedPreferences.setString('pending_registration_user_type', 'client');

      return Right(result['email'] as String);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, void>> resendOtp({required String email}) async {
    try {
      await remoteDataSource.resendOtp(email: email);
      return const Right(null);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUserInfo() async {
    try {
      final result = await remoteDataSource.getCurrentUserInfo();
      final userType = result['user_type'] as String;
      final userJson = result['account_info'] as Map<String, dynamic>;

      final user = UserModel.fromJson(userJson, userType);

      // Mettre à jour le cache local
      await sharedPreferences.setString(_userKey, json.encode(user.toJson()));

      return Right(user);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, void>> changePassword({
    required String ancienMotDePasse,
    required String nouveauMotDePasse,
  }) async {
    try {
      await remoteDataSource.changePassword(
        ancienMotDePasse: ancienMotDePasse,
        nouveauMotDePasse: nouveauMotDePasse,
      );
      return const Right(null);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, String>> updateProfilePhoto({
    required String filePath,
  }) async {
    try {
      final photoUrl = await remoteDataSource.updateProfilePhoto(
        filePath: filePath,
      );

      // Mettre à jour le cache local
      final cachedUserResult = await getCachedUser();
      cachedUserResult.fold(
        (failure) => null,
        (user) async {
          final updatedUserJson = UserModel.fromEntity(user).toJson();
          updatedUserJson['photo_url'] = photoUrl;
          await sharedPreferences.setString(_userKey, json.encode(updatedUserJson));
        },
      );

      return Right(photoUrl);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      // Appel API (optionnel)
      await remoteDataSource.logout();

      // Nettoyer le stockage local
      await sharedPreferences.remove(_tokenKey);
      await sharedPreferences.remove(_refreshTokenKey);
      await sharedPreferences.remove(_userKey);
      await sharedPreferences.remove(_userTypeKey);

      return const Right(null);
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
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

  @override
  Future<Either<Failure, User>> getCachedUser() async {
    try {
      final userJson = sharedPreferences.getString(_userKey);
      final userType = sharedPreferences.getString(_userTypeKey);

      if (userJson == null || userType == null) {
        return const Left(CacheFailure('Aucune donnée utilisateur en cache'));
      }

      final userMap = json.decode(userJson) as Map<String, dynamic>;
      final user = UserModel.fromJson(userMap, userType);

      return Right(user);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  /// Save auth data to local storage
  Future<void> _saveAuthData({
    required String token,
    required String refreshToken,
    required UserModel user,
  }) async {
    await sharedPreferences.setString(_tokenKey, token);
    await sharedPreferences.setString(_refreshTokenKey, refreshToken);
    await sharedPreferences.setString(_userKey, json.encode(user.toJson()));
    await sharedPreferences.setString(
      _userTypeKey,
      userRoleToString(user.userType),
    );
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
    } else if (message.contains('Compte inactif')) {
      return ForbiddenFailure(message);
    } else if (message.contains('Validation échouée') ||
        message.contains('invalide')) {
      return ValidationFailure(message);
    } else if (message.contains('non trouvée')) {
      return NotFoundFailure(message);
    } else {
      return ServerFailure(message);
    }
  }
}