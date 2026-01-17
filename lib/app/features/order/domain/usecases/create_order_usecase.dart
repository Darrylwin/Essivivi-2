import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case for creating a new order (Client)
class CreateOrderUseCase {
  final OrderRepository repository;

  CreateOrderUseCase(this.repository);

  Future<Either<Failure, Order>> call(CreateOrderParams params) async {
    // Validate inputs
    if (params.quantity <= 0) {
      return const Left(
        ValidationFailure('La quantité doit être supérieure à 0'),
      );
    }

    if (params.deliveryAddress.isEmpty) {
      return const Left(EmptyFieldFailure('Adresse de livraison requise'));
    }

    // Call repository
    return await repository.createOrder(
      quantity: params.quantity,
      deliveryAddress: params.deliveryAddress,
      latitude: params.latitude,
      longitude: params.longitude,
      preferredDeliveryDate: params.preferredDeliveryDate,
    );
  }
}

/// Create order parameters
class CreateOrderParams {
  final int quantity;
  final String deliveryAddress;
  final double latitude;
  final double longitude;
  final DateTime? preferredDeliveryDate;

  CreateOrderParams({
    required this.quantity,
    required this.deliveryAddress,
    required this.latitude,
    required this.longitude,
    this.preferredDeliveryDate,
  });
}