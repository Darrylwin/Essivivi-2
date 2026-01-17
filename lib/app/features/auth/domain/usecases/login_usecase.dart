import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Use case for user login
class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  /// Execute login
  Future<Either<Failure, User>> call(LoginParams params) async {
    // Validate inputs
    if (params.identifier.isEmpty) {
      return const Left(EmptyFieldFailure('Email/Téléphone requis'));
    }

    if (params.password.isEmpty) {
      return const Left(EmptyFieldFailure('Mot de passe requis'));
    }

    if (params.password.length < 6) {
      return const Left(
        ValidationFailure('Le mot de passe doit contenir au moins 6 caractères'),
      );
    }

    // Call repository
    return await repository.login(
      identifier: params.identifier,
      password: params.password,
    );
  }
}

/// Login parameters
class LoginParams {
  final String identifier; // Email or phone
  final String password;

  LoginParams({
    required this.identifier,
    required this.password,
  });
}