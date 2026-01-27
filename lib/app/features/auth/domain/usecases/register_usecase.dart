import 'package:dartz/dartz.dart';

import '../repositories/auth_repository.dart';
import '../../../../core/error/failures.dart';

/// Use case pour l'inscription d'un nouveau client
class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  /// Execute registration
  /// Returns Either<Failure, String> où String est l'email
  Future<Either<Failure, String>> call(RegisterParams params) async {
    // Validation des inputs
    if (params.nomPointVente.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Nom du point de vente requis'));
    }

    if (params.nomResponsable.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Nom du responsable requis'));
    }

    if (params.telephone.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Téléphone requis'));
    }

    if (params.email.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Email requis'));
    }

    // Validation email format
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(params.email.trim())) {
      return const Left(InvalidEmailFailure());
    }

    if (params.motDePasse.isEmpty) {
      return const Left(EmptyFieldFailure('Mot de passe requis'));
    }

    if (params.motDePasse.length < 6) {
      return const Left(
        ValidationFailure('Le mot de passe doit contenir au moins 6 caractères'),
      );
    }

    if (params.adresse.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Adresse requise'));
    }

    // Validation type client
    final validTypes = ['detaillant', 'grossiste', 'institution'];
    if (!validTypes.contains(params.typeClient.toLowerCase())) {
      return const Left(ValidationFailure('Type de client invalide'));
    }

    // Validation coordonnées GPS (optionnelles mais si fournies, doivent être valides)
    if (params.latitude != null || params.longitude != null) {
      if (params.latitude == null || params.longitude == null) {
        return const Left(
          ValidationFailure('Latitude et longitude doivent être fournies ensemble'),
        );
      }
      if (params.latitude! < -90 || params.latitude! > 90) {
        return const Left(ValidationFailure('Latitude invalide (-90 à 90)'));
      }
      if (params.longitude! < -180 || params.longitude! > 180) {
        return const Left(ValidationFailure('Longitude invalide (-180 à 180)'));
      }
    }

    // Appel au repository
    return await repository.register(
      nomPointVente: params.nomPointVente.trim(),
      nomResponsable: params.nomResponsable.trim(),
      telephone: params.telephone.trim(),
      email: params.email.trim(),
      motDePasse: params.motDePasse,
      adresse: params.adresse.trim(),
      latitude: params.latitude,
      longitude: params.longitude,
      typeClient: params.typeClient.toLowerCase(),
    );
  }
}

/// Paramètres pour l'inscription
class RegisterParams {
  final String nomPointVente;
  final String nomResponsable;
  final String telephone;
  final String email;
  final String motDePasse;
  final String adresse;
  final double? latitude;
  final double? longitude;
  final String typeClient; // 'detaillant', 'grossiste', 'institution'

  RegisterParams({
    required this.nomPointVente,
    required this.nomResponsable,
    required this.telephone,
    required this.email,
    required this.motDePasse,
    required this.adresse,
    this.latitude,
    this.longitude,
    required this.typeClient,
  });
}