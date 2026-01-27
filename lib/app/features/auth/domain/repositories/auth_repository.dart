import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';

/// Authentication repository interface
/// La couche Data implémentera cette interface
abstract class AuthRepository {
  /// Login avec email et mot de passe (pour mobile: Client et Agent)
  /// Envoie un OTP par email après vérification
  /// Returns Either<Failure, String> où String est l'email pour la vérification OTP
  Future<Either<Failure, String>> login({
    required String email,
    required String motDePasse,
  });

  /// Vérifier le code OTP reçu par email
  /// Complète l'authentification et retourne le User + tokens
  /// Returns Either<Failure, Map<String, dynamic>> contenant 'user' et 'tokens'
  Future<Either<Failure, Map<String, dynamic>>> verifyOtp({
    required String email,
    required String otp,
  });

  /// Inscription d'un nouveau client (mobile)
  /// Envoie un OTP par email pour validation
  /// Returns Either<Failure, String> où String est l'email
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
  });

  /// Renvoyer un nouveau code OTP
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> resendOtp({
    required String email,
  });

  /// Récupérer les informations du compte utilisateur connecté
  /// Returns Either<Failure, User>
  Future<Either<Failure, User>> getCurrentUserInfo();

  /// Changer le mot de passe
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> changePassword({
    required String ancienMotDePasse,
    required String nouveauMotDePasse,
  });

  /// Mettre à jour la photo de profil
  /// Returns Either<Failure, String> où String est la nouvelle URL de la photo
  Future<Either<Failure, String>> updateProfilePhoto({
    required String filePath,
  });

  /// Logout
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> logout();

  /// Vérifier si l'utilisateur est connecté (a des tokens valides)
  /// Returns Either<Failure, bool>
  Future<Either<Failure, bool>> isLoggedIn();

  /// Récupérer l'utilisateur depuis le cache local
  /// Returns Either<Failure, User>
  Future<Either<Failure, User>> getCachedUser();
}