import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case pour récupérer mes commandes
class GetMyOrdersUseCase {
  final OrderRepository repository;

  GetMyOrdersUseCase(this.repository);

  /// Execute get my orders
  Future<Either<Failure, List<Order>>> call() async {
    return await repository.getMyOrders();
  }
}