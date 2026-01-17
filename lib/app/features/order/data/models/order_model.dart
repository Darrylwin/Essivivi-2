import '../../domain/entities/order.dart';

/// Order model - Data layer
class OrderModel extends Order {
  const OrderModel({
    required super.id,
    required super.clientId,
    required super.clientName,
    required super.clientPhone,
    required super.deliveryAddress,
    required super.latitude,
    required super.longitude,
    required super.quantityOrdered,
    required super.quantityDelivered,
    required super.status,
    super.assignedAgentId,
    super.assignedAgentName,
    required super.createdAt,
    super.preferredDeliveryDate,
    super.updatedAt,
  });

  /// Create OrderModel from JSON
  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id']?.toString() ?? '',
      clientId: json['client_id']?.toString() ?? '',
      clientName: json['client_name'] ?? '',
      clientPhone: json['client_phone'] ?? '',
      deliveryAddress: json['delivery_address'] ?? '',
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
      quantityOrdered: json['quantity_ordered'] ?? 0,
      quantityDelivered: json['quantity_delivered'] ?? 0,
      status: orderStatusFromString(json['status'] ?? 'pending'),
      assignedAgentId: json['assigned_agent_id']?.toString(),
      assignedAgentName: json['assigned_agent_name'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      preferredDeliveryDate: json['preferred_delivery_date'] != null
          ? DateTime.parse(json['preferred_delivery_date'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  /// Convert OrderModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client_id': clientId,
      'client_name': clientName,
      'client_phone': clientPhone,
      'delivery_address': deliveryAddress,
      'latitude': latitude,
      'longitude': longitude,
      'quantity_ordered': quantityOrdered,
      'quantity_delivered': quantityDelivered,
      'status': statusString,
      'assigned_agent_id': assignedAgentId,
      'assigned_agent_name': assignedAgentName,
      'created_at': createdAt.toIso8601String(),
      'preferred_delivery_date': preferredDeliveryDate?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  /// Create OrderModel from Order entity
  factory OrderModel.fromEntity(Order order) {
    return OrderModel(
      id: order.id,
      clientId: order.clientId,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      deliveryAddress: order.deliveryAddress,
      latitude: order.latitude,
      longitude: order.longitude,
      quantityOrdered: order.quantityOrdered,
      quantityDelivered: order.quantityDelivered,
      status: order.status,
      assignedAgentId: order.assignedAgentId,
      assignedAgentName: order.assignedAgentName,
      createdAt: order.createdAt,
      preferredDeliveryDate: order.preferredDeliveryDate,
      updatedAt: order.updatedAt,
    );
  }

  /// Convert to Order entity
  Order toEntity() {
    return Order(
      id: id,
      clientId: clientId,
      clientName: clientName,
      clientPhone: clientPhone,
      deliveryAddress: deliveryAddress,
      latitude: latitude,
      longitude: longitude,
      quantityOrdered: quantityOrdered,
      quantityDelivered: quantityDelivered,
      status: status,
      assignedAgentId: assignedAgentId,
      assignedAgentName: assignedAgentName,
      createdAt: createdAt,
      preferredDeliveryDate: preferredDeliveryDate,
      updatedAt: updatedAt,
    );
  }

  /// CopyWith method
  OrderModel copyWith({
    String? id,
    String? clientId,
    String? clientName,
    String? clientPhone,
    String? deliveryAddress,
    double? latitude,
    double? longitude,
    int? quantityOrdered,
    int? quantityDelivered,
    OrderStatus? status,
    String? assignedAgentId,
    String? assignedAgentName,
    DateTime? createdAt,
    DateTime? preferredDeliveryDate,
    DateTime? updatedAt,
  }) {
    return OrderModel(
      id: id ?? this.id,
      clientId: clientId ?? this.clientId,
      clientName: clientName ?? this.clientName,
      clientPhone: clientPhone ?? this.clientPhone,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      quantityOrdered: quantityOrdered ?? this.quantityOrdered,
      quantityDelivered: quantityDelivered ?? this.quantityDelivered,
      status: status ?? this.status,
      assignedAgentId: assignedAgentId ?? this.assignedAgentId,
      assignedAgentName: assignedAgentName ?? this.assignedAgentName,
      createdAt: createdAt ?? this.createdAt,
      preferredDeliveryDate:
          preferredDeliveryDate ?? this.preferredDeliveryDate,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
