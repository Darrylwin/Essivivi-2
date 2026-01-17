import 'package:equatable/equatable.dart';

/// Base class for all failures
abstract class Failure extends Equatable {
  final String message;

  const Failure(this.message);

  @override
  List<Object> get props => [message];
}

// =====================================================
// Server Failures
// =====================================================

/// Failure when server returns an error
class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

/// Failure when there's no internet connection
class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Pas de connexion internet']);
}

/// Failure when request times out
class TimeoutFailure extends Failure {
  const TimeoutFailure([super.message = 'La requête a expiré']);
}

// =====================================================
// Authentication Failures
// =====================================================

/// Failure when credentials are invalid
class InvalidCredentialsFailure extends Failure {
  const InvalidCredentialsFailure([
    super.message = 'Identifiants invalides',
  ]);
}

/// Failure when user is not authenticated
class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([
    super.message = 'Non autorisé. Veuillez vous reconnecter',
  ]);
}

/// Failure when token has expired
class TokenExpiredFailure extends Failure {
  const TokenExpiredFailure([
    super.message = 'Session expirée. Veuillez vous reconnecter',
  ]);
}

// =====================================================
// Validation Failures
// =====================================================

/// Failure when input validation fails
class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}

/// Failure when required field is empty
class EmptyFieldFailure extends ValidationFailure {
  const EmptyFieldFailure([super.message = 'Ce champ est requis']);
}

/// Failure when phone number is invalid
class InvalidPhoneFailure extends ValidationFailure {
  const InvalidPhoneFailure([
    super.message = 'Numéro de téléphone invalide',
  ]);
}

/// Failure when email is invalid
class InvalidEmailFailure extends ValidationFailure {
  const InvalidEmailFailure([super.message = 'Email invalide']);
}

// =====================================================
// Business Logic Failures
// =====================================================

/// Failure when requested resource is not found
class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message = 'Ressource non trouvée']);
}

/// Failure when operation is forbidden
class ForbiddenFailure extends Failure {
  const ForbiddenFailure([
    super.message = 'Vous n\'avez pas la permission d\'effectuer cette action',
  ]);
}

/// Failure when there's a conflict (e.g., duplicate entry)
class ConflictFailure extends Failure {
  const ConflictFailure(super.message);
}

/// Failure when GPS/Location services are disabled
class LocationFailure extends Failure {
  const LocationFailure([
    super.message = 'Impossible d\'obtenir la localisation',
  ]);
}

/// Failure when GPS permission is denied
class LocationPermissionFailure extends Failure {
  const LocationPermissionFailure([
    super.message = 'Permission de localisation refusée',
  ]);
}

// =====================================================
// Cache Failures
// =====================================================

/// Failure when local cache operation fails
class CacheFailure extends Failure {
  const CacheFailure([
    super.message = 'Erreur de stockage local',
  ]);
}

// =====================================================
// Generic Failure
// =====================================================

/// Generic failure for unexpected errors
class UnexpectedFailure extends Failure {
  const UnexpectedFailure([
    super.message = 'Une erreur inattendue s\'est produite',
  ]);
}

// =====================================================
// Helper function to map exceptions to failures
// =====================================================

/// Maps common exceptions to appropriate Failure types
Failure mapExceptionToFailure(dynamic exception) {
  if (exception is ServerFailure ||
      exception is NetworkFailure ||
      exception is ValidationFailure) {
    return exception as Failure;
  }
  
  // Add more mappings as needed
  return UnexpectedFailure(exception.toString());
}