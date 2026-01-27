import 'package:equatable/equatable.dart';
import '../../domain/repositories/order_repository.dart';

/// Base class for all order events
abstract class OrderEvent extends Equatable {
  const OrderEvent();

  @override
  List<Object?> get props => [];
}

// =====================================================
// Product Events
// =====================================================

/// Événement pour charger les produits
class LoadProductsRequested extends OrderEvent {
  const LoadProductsRequested();
}

// =====================================================
// Cart Events
// =====================================================

/// Événement pour ajouter un produit au panier
class AddToCartRequested extends OrderEvent {
  final int produitId;
  final int quantite;

  const AddToCartRequested({
    required this.produitId,
    this.quantite = 1,
  });

  @override
  List<Object?> get props => [produitId, quantite];
}

/// Événement pour retirer un produit du panier
class RemoveFromCartRequested extends OrderEvent {
  final int produitId;

  const RemoveFromCartRequested(this.produitId);

  @override
  List<Object?> get props => [produitId];
}

/// Événement pour mettre à jour la quantité d'un produit
class UpdateCartQuantityRequested extends OrderEvent {
  final int produitId;
  final int quantite;

  const UpdateCartQuantityRequested({
    required this.produitId,
    required this.quantite,
  });

  @override
  List<Object?> get props => [produitId, quantite];
}

/// Événement pour vider le panier
class ClearCartRequested extends OrderEvent {
  const ClearCartRequested();
}

// =====================================================
// Order Creation Events
// =====================================================

/// Événement pour créer une commande
class CreateOrderRequested extends OrderEvent {
  final double? latitudeLivraison;
  final double? longitudeLivraison;
  final bool utiliserCoordonneesClient;
  final String? adresseTextuelle;
  final List<OrderLineItem> lignes;

  const CreateOrderRequested({
    this.latitudeLivraison,
    this.longitudeLivraison,
    this.utiliserCoordonneesClient = false,
    this.adresseTextuelle,
    required this.lignes,
  });

  @override
  List<Object?> get props => [
        latitudeLivraison,
        longitudeLivraison,
        utiliserCoordonneesClient,
        adresseTextuelle,
        lignes,
      ];
}

// =====================================================
// Order List Events
// =====================================================

/// Événement pour charger mes commandes
class LoadMyOrdersRequested extends OrderEvent {
  const LoadMyOrdersRequested();
}

/// Événement pour rafraîchir mes commandes
class RefreshMyOrdersRequested extends OrderEvent {
  const RefreshMyOrdersRequested();
}

// =====================================================
// Order Details Events
// =====================================================

/// Événement pour charger les détails d'une commande
class LoadOrderDetailsRequested extends OrderEvent {
  final int orderId;

  const LoadOrderDetailsRequested(this.orderId);

  @override
  List<Object?> get props => [orderId];
}

// =====================================================
// Order Cancel Event
// =====================================================

/// Événement pour annuler une commande
class CancelOrderRequested extends OrderEvent {
  final int orderId;

  const CancelOrderRequested(this.orderId);

  @override
  List<Object?> get props => [orderId];
}