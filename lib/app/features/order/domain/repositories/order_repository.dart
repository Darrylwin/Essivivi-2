import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';

/// Order repository interface
abstract class OrderRepository {
  /// Create a new order (Client)
  Future<Either<Failure, Order>> createOrder({
    required int quantity,
    required String deliveryAddress,
    required double latitude,
    required double longitude,
    DateTime? preferredDeliveryDate,
  });

  /// Get orders for current user
  /// - Client: get MY orders
  /// - Agent: get ASSIGNED orders
  Future<Either<Failure, List<Order>>> getMyOrders();

  /// Get order details by ID
  Future<Either<Failure, Order>> getOrderById(String orderId);

  /// Get assigned orders for agent
  Future<Either<Failure, List<Order>>> getAssignedOrders();
}