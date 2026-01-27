import 'package:dio/dio.dart';
import '../models/order_model.dart';
import '../models/product_model.dart';
import '../../domain/repositories/order_repository.dart';

/// Order remote data source interface
abstract class OrderRemoteDataSource {
  /// Get products list
  Future<List<ProductModel>> getProducts();

  /// Create order
  Future<OrderModel> createOrder({
    required double latitudeLivraison,
    required double longitudeLivraison,
    bool utiliserCoordonneesClient = false,
    String? adresseTextuelle,
    required List<OrderLineItem> lignes,
  });

  /// Get my orders
  Future<List<OrderModel>> getMyOrders();

  /// Get order by ID
  Future<OrderModel> getOrderById(int orderId);

  /// Cancel order
  Future<void> cancelOrder(int orderId);
}

/// Implementation of OrderRemoteDataSource
class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final Dio dio;

  OrderRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<ProductModel>> getProducts() async {
    try {
      final response = await dio.get('/produits');

      if (response.statusCode == 200) {
        final data = response.data;
        
        // API returns {count: X, results: [...]}
        if (data is Map && data['results'] != null) {
          final List<dynamic> productsJson = data['results'];
          return productsJson.map((json) => ProductModel.fromJson(json)).toList();
        }
        
        throw Exception('Format de réponse invalide');
      } else {
        throw Exception('Erreur lors de la récupération des produits');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<OrderModel> createOrder({
    required double latitudeLivraison,
    required double longitudeLivraison,
    bool utiliserCoordonneesClient = false,
    String? adresseTextuelle,
    required List<OrderLineItem> lignes,
  }) async {
    try {
      final data = {
        'latitude_livraison': latitudeLivraison,
        'longitude_livraison': longitudeLivraison,
        'utiliser_coordonnees_client': utiliserCoordonneesClient,
        'lignes': lignes.map((l) => l.toJson()).toList(),
      };

      if (adresseTextuelle != null && adresseTextuelle.isNotEmpty) {
        data['adresse_textuelle'] = adresseTextuelle;
      }

      final response = await dio.post('/orders', data: data);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = response.data;
        
        // API returns {message: "...", commande: {...}}
        if (responseData is Map && responseData['commande'] != null) {
          return OrderModel.fromJson(responseData['commande']);
        }
        
        throw Exception('Format de réponse invalide');
      } else {
        throw Exception('Erreur lors de la création de la commande');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    try {
      final response = await dio.get('/orders');

      if (response.statusCode == 200) {
        final data = response.data;
        
        // API returns {count: X, results: [...]}
        if (data is Map && data['results'] != null) {
          final List<dynamic> ordersJson = data['results'];
          return ordersJson.map((json) => OrderModel.fromJson(json)).toList();
        }
        
        throw Exception('Format de réponse invalide');
      } else {
        throw Exception('Erreur lors de la récupération des commandes');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<OrderModel> getOrderById(int orderId) async {
    try {
      final response = await dio.get('/orders/$orderId');

      if (response.statusCode == 200) {
        return OrderModel.fromJson(response.data);
      } else {
        throw Exception('Erreur lors de la récupération de la commande');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  @override
  Future<void> cancelOrder(int orderId) async {
    try {
      // Assuming there's a cancel endpoint
      final response = await dio.delete('/orders/$orderId');

      if (response.statusCode != 200) {
        throw Exception('Erreur lors de l\'annulation de la commande');
      }
    } on DioException catch (e) {
      _handleDioException(e);
      rethrow;
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  void _handleDioException(DioException e) {
    if (e.response?.statusCode == 400) {
      final errorData = e.response?.data;
      if (errorData is Map) {
        final message = errorData['error'] ?? errorData['detail'] ?? 'Validation échouée';
        throw Exception(message);
      }
      throw Exception('Validation échouée');
    } else if (e.response?.statusCode == 401) {
      throw Exception('Non autorisé');
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