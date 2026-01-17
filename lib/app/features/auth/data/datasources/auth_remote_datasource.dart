import 'package:dio/dio.dart';
import '../models/user_model.dart';

/// Authentication remote data source interface
abstract class AuthRemoteDataSource {
  /// Login with identifier and password
  /// Returns UserModel and token
  Future<Map<String, dynamic>> login({
    required String identifier,
    required String password,
  });

  /// Logout (optional - some APIs need server-side logout)
  Future<void> logout();
}

/// Implementation of AuthRemoteDataSource
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl({required this.dio});

  @override
  Future<Map<String, dynamic>> login({
    required String identifier,
    required String password,
  }) async {
    try {
      final response = await dio.post(
        '/auth/login',
        data: {
          'identifier': identifier, // Backend accepte email ou phone
          'password': password,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;

        // Expected API response format:
        // {
        //   "success": true,
        //   "data": {
        //     "user": { ... },
        //     "token": "eyJhbGc..."
        //   }
        // }

        if (data['success'] == true && data['data'] != null) {
          final user = UserModel.fromJson(data['data']['user']);
          final token = data['data']['token'] as String;

          return {
            'user': user,
            'token': token,
          };
        } else {
          throw DioException(
            requestOptions: response.requestOptions,
            response: response,
            type: DioExceptionType.badResponse,
            error: 'Invalid response format',
          );
        }
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
        );
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('Identifiants invalides');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('La requête a expiré');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Pas de connexion internet');
      } else {
        throw Exception(
          e.response?.data['message'] ?? 'Erreur lors de la connexion',
        );
      }
    } catch (e) {
      throw Exception('Une erreur inattendue s\'est produite');
    }
  }

  @override
  Future<void> logout() async {
    try {
      // Optional: call backend logout endpoint if needed
      await dio.post('/auth/logout');
    } catch (e) {
      // Log error but don't throw - local logout should still work
      print('Logout API error: $e');
    }
  }
}
