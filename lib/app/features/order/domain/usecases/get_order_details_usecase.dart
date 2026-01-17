import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case to get order details by ID
class GetOrderDetailsUseCase {
  final OrderRepository repository;

  GetOrderDetailsUseCase(this.repository);

  Future<Either<Failure, Order>> call(String orderId) async {
    if (orderId.isEmpty) {
      return const Left(ValidationFailure('ID de commande invalide'));
    }

    return await repository.getOrderById(orderId);
  }
}