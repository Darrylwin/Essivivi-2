import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../../domain/entities/order.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

/// Implementation of OrderRepository
class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<Product>>> getProducts() async {
    try {
      final products = await remoteDataSource.getProducts();
      return Right(products);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, Order>> createOrder({
    required double latitudeLivraison,
    required double longitudeLivraison,
    bool utiliserCoordonneesClient = false,
    String? adresseTextuelle,
    required List<OrderLineItem> lignes,
  }) async {
    try {
      final order = await remoteDataSource.createOrder(
        latitudeLivraison: latitudeLivraison,
        longitudeLivraison: longitudeLivraison,
        utiliserCoordonneesClient: utiliserCoordonneesClient,
        adresseTextuelle: adresseTextuelle,
        lignes: lignes,
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
  Future<Either<Failure, Order>> getOrderById(int orderId) async {
    try {
      final order = await remoteDataSource.getOrderById(orderId);
      return Right(order);
    } on Exception catch (e) {
      return Left(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Either<Failure, void>> cancelOrder(int orderId) async {
    try {
      await remoteDataSource.cancelOrder(orderId);
      return const Right(null);
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
    } else if (message.contains('Validation échouée') ||
        message.contains('invalide')) {
      return ValidationFailure(message);
    } else {
      return ServerFailure(message);
    }
  }
}