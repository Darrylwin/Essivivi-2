import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/order.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

/// Implementation of OrderRepository
class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, Order>> createOrder({
    required int quantity,
    required String deliveryAddress,
    required double latitude,
    required double longitude,
    DateTime? preferredDeliveryDate,
  }) async {
    try {
      final order = await remoteDataSource.createOrder(
        quantity: quantity,
        deliveryAddress: deliveryAddress,
        latitude: latitude,
        longitude: longitude,
        preferredDeliveryDate: preferredDeliveryDate,
      );

      return Right(order);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, List<Order>>> getMyOrders() async {
    try {
      final orders = await remoteDataSource.getMyOrders();
      return Right(orders);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, Order>> getOrderById(String orderId) async {
    try {
      final order = await remoteDataSource.getOrderById(orderId);
      return Right(order);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, List<Order>>> getAssignedOrders() async {
    try {
      final orders = await remoteDataSource.getAssignedOrders();
      return Right(orders);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  Failure _mapExceptionToFailure(Exception exception) {
    final message = exception.toString().replaceAll('Exception: ', '');

    if (message.contains('connexion internet')) {
      return NetworkFailure(message);
    } else if (message.contains('expiré')) {
      return TimeoutFailure(message);
    } else if (message.contains('Non autorisé')) {
      return const UnauthorizedFailure();
    } else if (message.contains('non trouvée')) {
      return NotFoundFailure(message);
    } else if (message.contains('Format de réponse invalide')) {
      return ServerFailure(message);
    } else {
      return ServerFailure(message);
    }
  }
}