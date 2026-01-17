import 'package:equatable/equatable.dart';

/// Order entity - Domain layer
class Order extends Equatable {
  final String id;
  final String clientId;
  final String clientName;
  final String clientPhone;
  final String deliveryAddress;
  final double latitude;
  final double longitude;
  final int quantityOrdered;
  final int quantityDelivered;
  final OrderStatus status;
  final String? assignedAgentId;
  final String? assignedAgentName;
  final DateTime createdAt;
  final DateTime? preferredDeliveryDate;
  final DateTime? updatedAt;

  const Order({
    required this.id,
    required this.clientId,
    required this.clientName,
    required this.clientPhone,
    required this.deliveryAddress,
    required this.latitude,
    required this.longitude,
    required this.quantityOrdered,
    required this.quantityDelivered,
    required this.status,
    this.assignedAgentId,
    this.assignedAgentName,
    required this.createdAt,
    this.preferredDeliveryDate,
    this.updatedAt,
  });

  // =====================================================
  // Helper methods
  // =====================================================

  /// Get remaining quantity to deliver
  int get remainingQuantity => quantityOrdered - quantityDelivered;

  /// Check if order is fully delivered
  bool get isFullyDelivered => quantityDelivered >= quantityOrdered;

  /// Get progress percentage
  double get progressPercentage {
    if (quantityOrdered == 0) return 0;
    return (quantityDelivered / quantityOrdered) * 100;
  }

  /// Check if order is pending (not assigned yet)
  bool get isPending => status == OrderStatus.pending;

  /// Check if order is assigned
  bool get isAssigned => status == OrderStatus.assigned;

  /// Check if order is in progress
  bool get isInProgress => status == OrderStatus.inProgress;

  /// Check if order is delivered
  bool get isDelivered => status == OrderStatus.delivered;

  /// Check if order is cancelled
  bool get isCancelled => status == OrderStatus.cancelled;

  /// Get status as string
  String get statusString {
    switch (status) {
      case OrderStatus.pending:
        return 'pending';
      case OrderStatus.assigned:
        return 'assigned';
      case OrderStatus.inProgress:
        return 'inProgress';
      case OrderStatus.delivered:
        return 'delivered';
      case OrderStatus.cancelled:
        return 'cancelled';
    }
  }

  /// Get status display name (French)
  String get statusDisplayName {
    switch (status) {
      case OrderStatus.pending:
        return 'En attente';
      case OrderStatus.assigned:
        return 'Assignée';
      case OrderStatus.inProgress:
        return 'En cours';
      case OrderStatus.delivered:
        return 'Livrée';
      case OrderStatus.cancelled:
        return 'Annulée';
    }
  }

  @override
  List<Object?> get props => [
        id,
        clientId,
        clientName,
        clientPhone,
        deliveryAddress,
        latitude,
        longitude,
        quantityOrdered,
        quantityDelivered,
        status,
        assignedAgentId,
        assignedAgentName,
        createdAt,
        preferredDeliveryDate,
        updatedAt,
      ];
}

/// Order status enum
enum OrderStatus {
  pending, // En attente (pas encore assignée)
  assigned, // Assignée à un agent (aucune livraison)
  inProgress, // Livraisons partielles en cours
  delivered, // Totalement livrée
  cancelled, // Annulée
}

/// Helper to parse status from string
OrderStatus orderStatusFromString(String status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return OrderStatus.pending;
    case 'assigned':
      return OrderStatus.assigned;
    case 'inprogress':
    case 'in_progress':
      return OrderStatus.inProgress;
    case 'delivered':
      return OrderStatus.delivered;
    case 'cancelled':
      return OrderStatus.cancelled;
    default:
      return OrderStatus.pending;
  }
}
