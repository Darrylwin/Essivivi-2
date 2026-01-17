import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case to get assigned orders for agent
class GetAssignedOrdersUseCase {
  final OrderRepository repository;

  GetAssignedOrdersUseCase(this.repository);

  Future<Either<Failure, List<Order>>> call() async {
    return await repository.getAssignedOrders();
  }
}