import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case to get orders for current user
/// - Client: get MY orders
/// - Agent: get ASSIGNED orders
class GetMyOrdersUseCase {
  final OrderRepository repository;

  GetMyOrdersUseCase(this.repository);

  Future<Either<Failure, List<Order>>> call() async {
    return await repository.getMyOrders();
  }
}