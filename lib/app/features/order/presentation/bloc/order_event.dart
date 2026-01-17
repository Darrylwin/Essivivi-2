import 'package:equatable/equatable.dart';

/// Base class for all order events
abstract class OrderEvent extends Equatable {
  const OrderEvent();

  @override
  List<Object?> get props => [];
}

// =====================================================
// Order Creation Events
// =====================================================

/// Event to create a new order
class CreateOrderRequested extends OrderEvent {
  final int quantity;
  final String deliveryAddress;
  final double latitude;
  final double longitude;
  final DateTime? preferredDeliveryDate;

  const CreateOrderRequested({
    required this.quantity,
    required this.deliveryAddress,
    required this.latitude,
    required this.longitude,
    this.preferredDeliveryDate,
  });

  @override
  List<Object?> get props => [
        quantity,
        deliveryAddress,
        latitude,
        longitude,
        preferredDeliveryDate,
      ];
}

// =====================================================
// Order List Events
// =====================================================

/// Event to fetch orders for current user
class FetchMyOrdersRequested extends OrderEvent {
  const FetchMyOrdersRequested();
}

/// Event to fetch assigned orders (for agent)
class FetchAssignedOrdersRequested extends OrderEvent {
  const FetchAssignedOrdersRequested();
}

/// Event to refresh orders list
class RefreshOrdersRequested extends OrderEvent {
  const RefreshOrdersRequested();
}

// =====================================================
// Order Details Events
// =====================================================

/// Event to fetch order details by ID
class FetchOrderDetailsRequested extends OrderEvent {
  final String orderId;

  const FetchOrderDetailsRequested(this.orderId);

  @override
  List<Object?> get props => [orderId];
}
