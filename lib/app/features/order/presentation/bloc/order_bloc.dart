import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/create_order_usecase.dart';
import '../../domain/usecases/get_my_orders_usecase.dart';
import '../../domain/usecases/get_order_details_usecase.dart';
import '../../domain/usecases/get_assigned_orders_usecase.dart';
import 'order_event.dart';
import 'order_state.dart';

/// Order BLoC - Manages order-related state
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final CreateOrderUseCase createOrderUseCase;
  final GetMyOrdersUseCase getMyOrdersUseCase;
  final GetOrderDetailsUseCase getOrderDetailsUseCase;
  final GetAssignedOrdersUseCase getAssignedOrdersUseCase;

  OrderBloc({
    required this.createOrderUseCase,
    required this.getMyOrdersUseCase,
    required this.getOrderDetailsUseCase,
    required this.getAssignedOrdersUseCase,
  }) : super(const OrderInitial()) {
    // Register event handlers
    on<CreateOrderRequested>(_onCreateOrderRequested);
    on<FetchMyOrdersRequested>(_onFetchMyOrdersRequested);
    on<FetchAssignedOrdersRequested>(_onFetchAssignedOrdersRequested);
    on<FetchOrderDetailsRequested>(_onFetchOrderDetailsRequested);
    on<RefreshOrdersRequested>(_onRefreshOrdersRequested);
  }

  /// Handle create order request
  Future<void> _onCreateOrderRequested(
    CreateOrderRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderCreating());

    final result = await createOrderUseCase(
      CreateOrderParams(
        quantity: event.quantity,
        deliveryAddress: event.deliveryAddress,
        latitude: event.latitude,
        longitude: event.longitude,
        preferredDeliveryDate: event.preferredDeliveryDate,
      ),
    );

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (order) => emit(OrderCreated(order)),
    );
  }

  /// Handle fetch my orders request
  Future<void> _onFetchMyOrdersRequested(
    FetchMyOrdersRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());

    final result = await getMyOrdersUseCase();

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (orders) {
        if (orders.isEmpty) {
          emit(const OrdersEmpty());
        } else {
          emit(OrdersLoaded(orders));
        }
      },
    );
  }

  /// Handle fetch assigned orders request (for agent)
  Future<void> _onFetchAssignedOrdersRequested(
    FetchAssignedOrdersRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());

    final result = await getAssignedOrdersUseCase();

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (orders) {
        if (orders.isEmpty) {
          emit(const OrdersEmpty());
        } else {
          emit(OrdersLoaded(orders));
        }
      },
    );
  }

  /// Handle fetch order details request
  Future<void> _onFetchOrderDetailsRequested(
    FetchOrderDetailsRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());

    final result = await getOrderDetailsUseCase(event.orderId);

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (order) => emit(OrderDetailsLoaded(order)),
    );
  }

  /// Handle refresh orders request
  Future<void> _onRefreshOrdersRequested(
    RefreshOrdersRequested event,
    Emitter<OrderState> emit,
  ) async {
    // Use current state to determine which orders to fetch
    final currentState = state;

    if (currentState is OrdersLoaded) {
      // Refresh without showing loading
      final result = await getMyOrdersUseCase();

      result.fold(
        (failure) => emit(OrderError(failure.message)),
        (orders) {
          if (orders.isEmpty) {
            emit(const OrdersEmpty());
          } else {
            emit(OrdersLoaded(orders));
          }
        },
      );
    } else {
      // Show loading for first fetch
      add(const FetchMyOrdersRequested());
    }
  }
}
