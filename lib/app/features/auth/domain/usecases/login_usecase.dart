import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

/// Use case pour la connexion utilisateur (étape 1: envoi OTP)
class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  /// Execute login - envoie OTP
  /// Returns Either<Failure, String> où String est l'email
  Future<Either<Failure, String>> call(LoginParams params) async {
    // Validation des inputs
    if (params.email.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Email requis'));
    }

    if (params.motDePasse.isEmpty) {
      return const Left(EmptyFieldFailure('Mot de passe requis'));
    }

    if (params.motDePasse.length < 6) {
      return const Left(
        ValidationFailure('Le mot de passe doit contenir au moins 6 caractères'),
      );
    }

    // Appel au repository
    return await repository.login(
      email: params.email.trim(),
      motDePasse: params.motDePasse,
    );
  }
}

/// Paramètres pour le login
class LoginParams {
  final String email;
  final String motDePasse;

  LoginParams({
    required this.email,
    required this.motDePasse,
  });
}