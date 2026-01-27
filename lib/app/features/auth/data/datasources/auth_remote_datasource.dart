import 'package:dio/dio.dart';

/// Authentication remote data source interface
abstract class AuthRemoteDataSource {
  /// Login - étape 1: Envoie OTP
  /// Returns Map contenant 'email', 'user_type', etc.
  Future<Map<String, dynamic>> login({
    required String email,
    required String motDePasse,
  });

  /// Vérifier OTP - étape 2: Authentification complète
  /// Returns Map contenant 'user', 'token', 'refresh'
  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  });

  /// Inscription client
  /// Returns Map contenant 'email'
  Future<Map<String, dynamic>> register({
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

  /// Renvoyer OTP
  Future<void> resendOtp({required String email});

  /// Récupérer les infos du compte
  /// Returns Map contenant 'user_type' et 'account_info'
  Future<Map<String, dynamic>> getCurrentUserInfo();

  /// Changer le mot de passe
  Future<void> changePassword({
    required String ancienMotDePasse,
    required String nouveauMotDePasse,
  });

  /// Mettre à jour la photo de profil
  /// Returns nouvelle URL de la photo
  Future<String> updateProfilePhoto({required String filePath});

  /// Logout (optionnel côté serveur)
  Future<void> logout();
}

/// Implementation of AuthRemoteDataSource
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl({required this.dio});

  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String motDePasse,
  }) async {
    try {
      final response = await dio.post(
        '/auth/login',
        data: {
          'email': email,
          'mot_de_passe': motDePasse,
        },
      );

      if (response.statusCode == 200) {
        // Response format:
        // {
        //   "message": "Code OTP envoyé à votre email",
        //   "email": "user@example.com",
        //   "user_type": "agent",
        //   "requires_otp": true,
        //   "otp": "123456" // Pour tests uniquement
        // }
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception('Erreur lors de la connexion');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await dio.post(
        '/auth/otp/verify',
        data: {
          'email': email,
          'otp': otp,
        },
      );

      if (response.statusCode == 200) {
        // Response format:
        // {
        //   "message": "Authentification réussie",
        //   "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        //   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        //   "user_type": "agent",
        //   "user": { ... }
        // }
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception('Erreur lors de la vérification OTP');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> register({
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
      final data = {
        'nom_point_vente': nomPointVente,
        'nom_responsable': nomResponsable,
        'telephone': telephone,
        'email': email,
        'mot_de_passe': motDePasse,
        'adresse': adresse,
        'type_client': typeClient,
      };

      // Ajouter les coordonnées GPS si fournies
      if (latitude != null && longitude != null) {
        data['latitude'] = latitude.toString();
        data['longitude'] = longitude.toString();
      }

      final response = await dio.post('/auth/register', data: data);

      if (response.statusCode == 201) {
        // Response format:
        // {
        //   "message": "Inscription réussie. Un code OTP a été envoyé à votre email.",
        //   "email": "client@example.com",
        //   "expires_in_minutes": 10,
        //   "otp": "123456"
        // }
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception('Erreur lors de l\'inscription');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<void> resendOtp({required String email}) async {
    try {
      final response = await dio.post(
        '/auth/resend-otp',
        data: {'email': email},
      );

      if (response.statusCode != 200) {
        throw Exception('Erreur lors du renvoi de l\'OTP');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getCurrentUserInfo() async {
    try {
      final response = await dio.get('/auth/me');

      if (response.statusCode == 200) {
        // Response format:
        // {
        //   "user_type": "agent",
        //   "account_info": { ... }
        // }
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception('Erreur lors de la récupération des informations');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<void> changePassword({
    required String ancienMotDePasse,
    required String nouveauMotDePasse,
  }) async {
    try {
      final response = await dio.put(
        '/profile/password',
        data: {
          'ancien_mot_de_passe': ancienMotDePasse,
          'nouveau_mot_de_passe': nouveauMotDePasse,
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Erreur lors du changement de mot de passe');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<String> updateProfilePhoto({required String filePath}) async {
    try {
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(filePath),
      });

      final response = await dio.put('/profile/photo', data: formData);

      if (response.statusCode == 200) {
        // Response format: {"message": "...", "photo_url": "..."}
        return response.data['photo_url'] as String;
      } else {
        throw Exception('Erreur lors de la mise à jour de la photo');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<void> logout() async {
    try {
      // Optionnel: appel backend si nécessaire
      // await dio.post('/auth/logout');
    } catch (e) {
      // Ne pas bloquer le logout local même si l'appel API échoue
      print('Logout API error: $e');
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  void _handleDioException(DioException e) {
    if (e.response?.statusCode == 400) {
      final errorData = e.response?.data;
      if (errorData is Map) {
        // Extraire le message d'erreur
        final message = errorData['error'] ?? errorData['detail'] ?? 'Validation échouée';
        throw Exception(message);
      }
      throw Exception('Validation échouée');
    } else if (e.response?.statusCode == 401) {
      throw Exception('Identifiants invalides');
    } else if (e.response?.statusCode == 403) {
      throw Exception('Compte inactif');
    } else if (e.response?.statusCode == 404) {
      throw Exception('Ressource non trouvée');
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      throw Exception('La requête a expiré');
    } else if (e.type == DioExceptionType.connectionError) {
      throw Exception('Pas de connexion internet');
    } else {
      final message = e.response?.data?['message'] ?? 
                     e.response?.data?['error'] ?? 
                     'Erreur serveur';
      throw Exception(message);
    }
  }
}