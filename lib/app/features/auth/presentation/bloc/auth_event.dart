import 'package:equatable/equatable.dart';

/// Base class for all authentication events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

// =====================================================
// Login & OTP Events
// =====================================================

/// Événement pour démarrer le login (étape 1: envoi OTP)
class LoginRequested extends AuthEvent {
  final String email;
  final String motDePasse;

  const LoginRequested({
    required this.email,
    required this.motDePasse,
  });

  @override
  List<Object?> get props => [email, motDePasse];
}

/// Événement pour vérifier l'OTP (étape 2: authentification complète)
class VerifyOtpRequested extends AuthEvent {
  final String email;
  final String otp;

  const VerifyOtpRequested({
    required this.email,
    required this.otp,
  });

  @override
  List<Object?> get props => [email, otp];
}

/// Événement pour renvoyer un code OTP
class ResendOtpRequested extends AuthEvent {
  final String email;

  const ResendOtpRequested(this.email);

  @override
  List<Object?> get props => [email];
}

// =====================================================
// Registration Events
// =====================================================

/// Événement pour l'inscription d'un client
class RegisterRequested extends AuthEvent {
  final String nomPointVente;
  final String nomResponsable;
  final String telephone;
  final String email;
  final String motDePasse;
  final String adresse;
  final double? latitude;
  final double? longitude;
  final String typeClient;

  const RegisterRequested({
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

  @override
  List<Object?> get props => [
        nomPointVente,
        nomResponsable,
        telephone,
        email,
        motDePasse,
        adresse,
        latitude,
        longitude,
        typeClient,
      ];
}

// =====================================================
// User Info Events
// =====================================================

/// Événement pour récupérer les infos de l'utilisateur connecté
class GetCurrentUserRequested extends AuthEvent {
  const GetCurrentUserRequested();
}

/// Événement pour vérifier le statut d'authentification au démarrage
class CheckAuthStatus extends AuthEvent {
  const CheckAuthStatus();
}

// =====================================================
// Profile Management Events
// =====================================================

/// Événement pour changer le mot de passe
class ChangePasswordRequested extends AuthEvent {
  final String ancienMotDePasse;
  final String nouveauMotDePasse;

  const ChangePasswordRequested({
    required this.ancienMotDePasse,
    required this.nouveauMotDePasse,
  });

  @override
  List<Object?> get props => [ancienMotDePasse, nouveauMotDePasse];
}

/// Événement pour mettre à jour la photo de profil
class UpdateProfilePhotoRequested extends AuthEvent {
  final String filePath;

  const UpdateProfilePhotoRequested(this.filePath);

  @override
  List<Object?> get props => [filePath];
}

// =====================================================
// Logout Event
// =====================================================

/// Événement pour se déconnecter
class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}