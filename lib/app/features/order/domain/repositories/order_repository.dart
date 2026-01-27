import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../entities/product.dart';

/// Order repository interface
abstract class OrderRepository {
  /// Get list of available products
  Future<Either<Failure, List<Product>>> getProducts();

  /// Create a new order
  Future<Either<Failure, Order>> createOrder({
    required double latitudeLivraison,
    required double longitudeLivraison,
    bool utiliserCoordonneesClient = false,
    String? adresseTextuelle,
    required List<OrderLineItem> lignes,
  });

  /// Get my orders (client)
  Future<Either<Failure, List<Order>>> getMyOrders();

  /// Get order details by ID
  Future<Either<Failure, Order>> getOrderById(int orderId);

  /// Cancel order (if status is en_attente)
  Future<Either<Failure, void>> cancelOrder(int orderId);
}

/// Order line item for creating order
class OrderLineItem {
  final int produitId;
  final int quantite;

  OrderLineItem({
    required this.produitId,
    required this.quantite,
  });

  Map<String, dynamic> toJson() {
    return {
      'produit_id': produitId,
      'quantite': quantite,
    };
  }
}