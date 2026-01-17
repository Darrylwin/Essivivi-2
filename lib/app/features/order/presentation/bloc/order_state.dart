import 'package:equatable/equatable.dart';
import '../../domain/entities/order.dart';

/// Base class for all order states
abstract class OrderState extends Equatable {
  const OrderState();

  @override
  List<Object?> get props => [];
}

// =====================================================
// Initial State
// =====================================================

class OrderInitial extends OrderState {
  const OrderInitial();
}

// =====================================================
// Loading States
// =====================================================

class OrderLoading extends OrderState {
  const OrderLoading();
}

class OrderCreating extends OrderState {
  const OrderCreating();
}

// =====================================================
// Success States
// =====================================================

/// State when order is created successfully
class OrderCreated extends OrderState {
  final Order order;

  const OrderCreated(this.order);

  @override
  List<Object?> get props => [order];
}

/// State when orders list is loaded
class OrdersLoaded extends OrderState {
  final List<Order> orders;

  const OrdersLoaded(this.orders);

  @override
  List<Object?> get props => [orders];
}

/// State when order details are loaded
class OrderDetailsLoaded extends OrderState {
  final Order order;

  const OrderDetailsLoaded(this.order);

  @override
  List<Object?> get props => [order];
}

/// State when orders list is empty
class OrdersEmpty extends OrderState {
  const OrdersEmpty();
}

// =====================================================
// Error State
// =====================================================

class OrderError extends OrderState {
  final String message;

  const OrderError(this.message);

  @override
  List<Object?> get props => [message];
}
