import 'package:dio/dio.dart';
import '../models/order_model.dart';

/// Order remote data source interface
abstract class OrderRemoteDataSource {
  /// Create a new order
  Future<OrderModel> createOrder({
    required int quantity,
    required String deliveryAddress,
    required double latitude,
    required double longitude,
    DateTime? preferredDeliveryDate,
  });

  /// Get orders for current user
  Future<List<OrderModel>> getMyOrders();

  /// Get order by ID
  Future<OrderModel> getOrderById(String orderId);

  /// Get assigned orders (for agent)
  Future<List<OrderModel>> getAssignedOrders();
}

/// Implementation of OrderRemoteDataSource
class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final Dio dio;

  OrderRemoteDataSourceImpl({required this.dio});

  @override
  Future<OrderModel> createOrder({
    required int quantity,
    required String deliveryAddress,
    required double latitude,
    required double longitude,
    DateTime? preferredDeliveryDate,
  }) async {
    try {
      final response = await dio.post(
        '/orders',
        data: {
          'quantity': quantity,
          'delivery_address': deliveryAddress,
          'latitude': latitude,
          'longitude': longitude,
          if (preferredDeliveryDate != null)
            'preferred_delivery_date': preferredDeliveryDate.toIso8601String(),
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;

        // Expected API response:
        // {
        //   "success": true,
        //   "data": { ... order object ... }
        // }

        if (data['success'] == true && data['data'] != null) {
          return OrderModel.fromJson(data['data']);
        } else {
          throw Exception('Format de réponse invalide');
        }
      } else {
        throw Exception('Erreur lors de la création de la commande');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    } catch (e) {
      throw Exception('Une erreur inattendue s\'est produite');
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    try {
      final response = await dio.get('/orders/my-orders');

      if (response.statusCode == 200) {
        final data = response.data;

        // Expected API response:
        // {
        //   "success": true,
        //   "data": [ ... array of orders ... ]
        // }

        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> ordersJson = data['data'];
          return ordersJson.map((json) => OrderModel.fromJson(json)).toList();
        } else {
          throw Exception('Format de réponse invalide');
        }
      } else {
        throw Exception('Erreur lors de la récupération des commandes');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    } catch (e) {
      throw Exception('Une erreur inattendue s\'est produite');
    }
  }

  @override
  Future<OrderModel> getOrderById(String orderId) async {
    try {
      final response = await dio.get('/orders/$orderId');

      if (response.statusCode == 200) {
        final data = response.data;

        if (data['success'] == true && data['data'] != null) {
          return OrderModel.fromJson(data['data']);
        } else {
          throw Exception('Format de réponse invalide');
        }
      } else {
        throw Exception('Erreur lors de la récupération de la commande');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    } catch (e) {
      throw Exception('Une erreur inattendue s\'est produite');
    }
  }

  @override
  Future<List<OrderModel>> getAssignedOrders() async {
    try {
      final response = await dio.get('/orders/assigned');

      if (response.statusCode == 200) {
        final data = response.data;

        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> ordersJson = data['data'];
          return ordersJson.map((json) => OrderModel.fromJson(json)).toList();
        } else {
          throw Exception('Format de réponse invalide');
        }
      } else {
        throw Exception('Erreur lors de la récupération des commandes');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    } catch (e) {
      throw Exception('Une erreur inattendue s\'est produite');
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  void _handleDioException(DioException e) {
    if (e.response?.statusCode == 404) {
      throw Exception('Ressource non trouvée');
    } else if (e.response?.statusCode == 401) {
      throw Exception('Non autorisé');
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      throw Exception('La requête a expiré');
    } else if (e.type == DioExceptionType.connectionError) {
      throw Exception('Pas de connexion internet');
    } else {
      throw Exception(
        e.response?.data['message'] ?? 'Erreur serveur',
      );
    }
  }
}
