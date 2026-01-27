import 'package:equatable/equatable.dart';
import '../../domain/entities/order.dart';
import '../../domain/entities/product.dart';

/// Base class for all order states
abstract class OrderState extends Equatable {
  const OrderState();

  @override
  List<Object?> get props => [];
}

// =====================================================
// Initial & Loading States
// =====================================================

/// État initial
class OrderInitial extends OrderState {
  const OrderInitial();
}

/// État de chargement
class OrderLoading extends OrderState {
  const OrderLoading();
}

// =====================================================
// Products States
// =====================================================

/// État quand les produits sont chargés
class ProductsLoaded extends OrderState {
  final List<Product> products;
  final Map<int, int> cart; // produitId -> quantite

  const ProductsLoaded({
    required this.products,
    this.cart = const {},
  });

  /// Get cart items count
  int get cartItemsCount {
    return cart.values.fold(0, (sum, quantity) => sum + quantity);
  }

  /// Get cart total amount
  double get cartTotalAmount {
    double total = 0.0;
    cart.forEach((produitId, quantite) {
      final product = products.firstWhere(
        (p) => p.id == produitId,
        orElse: () => products.first,
      );
      total += product.prixUnitaire * quantite;
    });
    return total;
  }

  /// Check if product is in cart
  bool isInCart(int produitId) => cart.containsKey(produitId);

  /// Get product quantity in cart
  int getQuantity(int produitId) => cart[produitId] ?? 0;

  @override
  List<Object?> get props => [products, cart];
}

// =====================================================
// Order Creation States
// =====================================================

/// État quand la commande est en cours de création
class OrderCreating extends OrderState {
  const OrderCreating();
}

/// État quand la commande est créée avec succès
class OrderCreated extends OrderState {
  final Order order;
  final String message;

  const OrderCreated({
    required this.order,
    this.message = 'Commande créée avec succès',
  });

  @override
  List<Object?> get props => [order, message];
}

// =====================================================
// Orders List States
// =====================================================

/// État quand les commandes sont chargées
class MyOrdersLoaded extends OrderState {
  final List<Order> orders;

  const MyOrdersLoaded(this.orders);

  @override
  List<Object?> get props => [orders];
}

/// État quand la liste des commandes est vide
class MyOrdersEmpty extends OrderState {
  const MyOrdersEmpty();
}

// =====================================================
// Order Details States
// =====================================================

/// État quand les détails d'une commande sont chargés
class OrderDetailsLoaded extends OrderState {
  final Order order;

  const OrderDetailsLoaded(this.order);

  @override
  List<Object?> get props => [order];
}

// =====================================================
// Success State
// =====================================================

/// État de succès pour les opérations
class OrderOperationSuccess extends OrderState {
  final String message;

  const OrderOperationSuccess(this.message);

  @override
  List<Object?> get props => [message];
}

// =====================================================
// Error State
// =====================================================

/// État d'erreur
class OrderError extends OrderState {
  final String message;

  const OrderError(this.message);

  @override
  List<Object?> get props => [message];
}