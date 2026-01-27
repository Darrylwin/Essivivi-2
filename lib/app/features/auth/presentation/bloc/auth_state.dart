import 'package:equatable/equatable.dart';
import '../../domain/entities/user.dart';

/// Base class for all authentication states
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

// =====================================================
// Initial & Loading States
// =====================================================

/// État initial - pas encore vérifié
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// État de chargement - traitement en cours
class AuthLoading extends AuthState {
  const AuthLoading();
}

// =====================================================
// Login States
// =====================================================

/// État après login réussi - OTP envoyé
class OtpSent extends AuthState {
  final String email;
  final String userType; // 'client' ou 'agent'
  final String message;

  const OtpSent({
    required this.email,
    required this.userType,
    required this.message,
  });

  @override
  List<Object?> get props => [email, userType, message];
}

/// État après vérification OTP réussie - utilisateur authentifié
class AuthAuthenticated extends AuthState {
  final User user;

  const AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

// =====================================================
// Registration States
// =====================================================

/// État après inscription réussie - OTP envoyé pour validation
class RegistrationOtpSent extends AuthState {
  final String email;
  final String message;

  const RegistrationOtpSent({
    required this.email,
    required this.message,
  });

  @override
  List<Object?> get props => [email, message];
}

// =====================================================
// Unauthenticated State
// =====================================================

/// État non authentifié - aucun utilisateur connecté
class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

// =====================================================
// Success States (Operations)
// =====================================================

/// État de succès pour les opérations (changement mot de passe, photo, etc.)
class AuthOperationSuccess extends AuthState {
  final String message;
  final User? updatedUser; // Pour les updates de profil

  const AuthOperationSuccess({
    required this.message,
    this.updatedUser,
  });

  @override
  List<Object?> get props => [message, updatedUser];
}

/// État spécifique pour OTP renvoyé
class OtpResent extends AuthState {
  final String message;

  const OtpResent(this.message);

  @override
  List<Object?> get props => [message];
}

// =====================================================
// Error State
// =====================================================

/// État d'erreur - une opération a échoué
class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}