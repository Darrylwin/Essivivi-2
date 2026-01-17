import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';

/// Authentication repository interface
/// Data layer will implement this
abstract class AuthRepository {
  /// Login with email/phone and password
  /// Returns Either<Failure, User>
  Future<Either<Failure, User>> login({
    required String identifier, // Email or phone
    required String password,
  });

  /// Logout current user
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> logout();

  /// Get current logged in user from storage
  /// Returns Either<Failure, User>
  Future<Either<Failure, User>> getCurrentUser();

  /// Check if user is logged in
  /// Returns Either<Failure, bool>
  Future<Either<Failure, bool>> isLoggedIn();
}