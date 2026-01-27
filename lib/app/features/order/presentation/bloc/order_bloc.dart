import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/create_order_usecase.dart';
import '../../domain/usecases/get_my_orders_usecase.dart';
import '../../domain/usecases/get_order_details_usecase.dart';
import 'order_event.dart';
import 'order_state.dart';

/// Order BLoC - Gère tout ce qui concerne les commandes
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final GetProductsUseCase getProductsUseCase;
  final CreateOrderUseCase createOrderUseCase;
  final GetMyOrdersUseCase getMyOrdersUseCase;
  final GetOrderDetailsUseCase getOrderDetailsUseCase;

  // Cart state (Map: produitId -> quantite)
  Map<int, int> _cart = {};

  OrderBloc({
    required this.getProductsUseCase,
    required this.createOrderUseCase,
    required this.getMyOrdersUseCase,
    required this.getOrderDetailsUseCase,
  }) : super(const OrderInitial()) {
    // Register event handlers
    on<LoadProductsRequested>(_onLoadProductsRequested);
    on<AddToCartRequested>(_onAddToCartRequested);
    on<RemoveFromCartRequested>(_onRemoveFromCartRequested);
    on<UpdateCartQuantityRequested>(_onUpdateCartQuantityRequested);
    on<ClearCartRequested>(_onClearCartRequested);
    on<CreateOrderRequested>(_onCreateOrderRequested);
    on<LoadMyOrdersRequested>(_onLoadMyOrdersRequested);
    on<RefreshMyOrdersRequested>(_onRefreshMyOrdersRequested);
    on<LoadOrderDetailsRequested>(_onLoadOrderDetailsRequested);
  }

  // =====================================================
  // Product Events Handlers
  // =====================================================

  Future<void> _onLoadProductsRequested(
    LoadProductsRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());

    final result = await getProductsUseCase();

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (products) {
        if (products.isEmpty) {
          emit(const OrderError('Aucun produit disponible'));
        } else {
          emit(ProductsLoaded(products: products, cart: _cart));
        }
      },
    );
  }

  // =====================================================
  // Cart Events Handlers
  // =====================================================

  void _onAddToCartRequested(
    AddToCartRequested event,
    Emitter<OrderState> emit,
  ) {
    if (state is ProductsLoaded) {
      final currentState = state as ProductsLoaded;

      // Add or increment quantity
      if (_cart.containsKey(event.produitId)) {
        _cart[event.produitId] = _cart[event.produitId]! + event.quantite;
      } else {
        _cart[event.produitId] = event.quantite;
      }

      emit(ProductsLoaded(
        products: currentState.products,
        cart: Map.from(_cart),
      ));
    }
  }

  void _onRemoveFromCartRequested(
    RemoveFromCartRequested event,
    Emitter<OrderState> emit,
  ) {
    if (state is ProductsLoaded) {
      final currentState = state as ProductsLoaded;

      _cart.remove(event.produitId);

      emit(ProductsLoaded(
        products: currentState.products,
        cart: Map.from(_cart),
      ));
    }
  }

  void _onUpdateCartQuantityRequested(
    UpdateCartQuantityRequested event,
    Emitter<OrderState> emit,
  ) {
    if (state is ProductsLoaded) {
      final currentState = state as ProductsLoaded;

      if (event.quantite <= 0) {
        _cart.remove(event.produitId);
      } else {
        _cart[event.produitId] = event.quantite;
      }

      emit(ProductsLoaded(
        products: currentState.products,
        cart: Map.from(_cart),
      ));
    }
  }

  void _onClearCartRequested(
    ClearCartRequested event,
    Emitter<OrderState> emit,
  ) {
    if (state is ProductsLoaded) {
      final currentState = state as ProductsLoaded;

      _cart.clear();

      emit(ProductsLoaded(
        products: currentState.products,
        cart: Map.from(_cart),
      ));
    }
  }

  // =====================================================
  // Order Creation Handler
  // =====================================================

  Future<void> _onCreateOrderRequested(
    CreateOrderRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderCreating());

    final result = await createOrderUseCase(
      CreateOrderParams(
        latitudeLivraison: event.latitudeLivraison,
        longitudeLivraison: event.longitudeLivraison,
        utiliserCoordonneesClient: event.utiliserCoordonneesClient,
        adresseTextuelle: event.adresseTextuelle,
        lignes: event.lignes,
      ),
    );

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (order) {
        // Clear cart after successful order
        _cart.clear();
        emit(OrderCreated(order: order));
      },
    );
  }

  // =====================================================
  // Orders List Handlers
  // =====================================================

  Future<void> _onLoadMyOrdersRequested(
    LoadMyOrdersRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());

    final result = await getMyOrdersUseCase();

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (orders) {
        if (orders.isEmpty) {
          emit(const MyOrdersEmpty());
        } else {
          emit(MyOrdersLoaded(orders));
        }
      },
    );
  }

  Future<void> _onRefreshMyOrdersRequested(
    RefreshMyOrdersRequested event,
    Emitter<OrderState> emit,
  ) async {
    // Refresh without showing loading
    final result = await getMyOrdersUseCase();

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (orders) {
        if (orders.isEmpty) {
          emit(const MyOrdersEmpty());
        } else {
          emit(MyOrdersLoaded(orders));
        }
      },
    );
  }

  // =====================================================
  // Order Details Handler
  // =====================================================

  Future<void> _onLoadOrderDetailsRequested(
    LoadOrderDetailsRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());

    final result = await getOrderDetailsUseCase(event.orderId);

    result.fold(
      (failure) => emit(OrderError(failure.message)),
      (order) => emit(OrderDetailsLoaded(order)),
    );
  }
}