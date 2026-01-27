import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

/// Use case pour changer le mot de passe
class ChangePasswordUseCase {
  final AuthRepository repository;

  ChangePasswordUseCase(this.repository);

  /// Execute change password
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> call(ChangePasswordParams params) async {
    // Validation
    if (params.ancienMotDePasse.isEmpty) {
      return const Left(EmptyFieldFailure('Ancien mot de passe requis'));
    }

    if (params.nouveauMotDePasse.isEmpty) {
      return const Left(EmptyFieldFailure('Nouveau mot de passe requis'));
    }

    if (params.nouveauMotDePasse.length < 6) {
      return const Left(
        ValidationFailure('Le nouveau mot de passe doit contenir au moins 6 caractères'),
      );
    }

    if (params.ancienMotDePasse == params.nouveauMotDePasse) {
      return const Left(
        ValidationFailure('Le nouveau mot de passe doit être différent de l\'ancien'),
      );
    }

    // Appel au repository
    return await repository.changePassword(
      ancienMotDePasse: params.ancienMotDePasse,
      nouveauMotDePasse: params.nouveauMotDePasse,
    );
  }
}

/// Paramètres pour changer le mot de passe
class ChangePasswordParams {
  final String ancienMotDePasse;
  final String nouveauMotDePasse;

  ChangePasswordParams({
    required this.ancienMotDePasse,
    required this.nouveauMotDePasse,
  });
}