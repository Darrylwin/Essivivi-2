import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case pour récupérer les détails d'une commande
class GetOrderDetailsUseCase {
  final OrderRepository repository;

  GetOrderDetailsUseCase(this.repository);

  /// Execute get order details
  Future<Either<Failure, Order>> call(int orderId) async {
    if (orderId <= 0) {
      return const Left(ValidationFailure('ID de commande invalide'));
    }

    return await repository.getOrderById(orderId);
  }
}