import '../../domain/entities/user.dart';

/// User model - Data layer
/// Extends User entity and adds JSON serialization
class UserModel extends User {
  const UserModel({
    required super.id,
    required super.name,
    required super.phone,
    required super.email,
    required super.role,
    super.profilePhoto,
    super.assignedVehicle,
  });

  /// Create UserModel from JSON
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      role: userRoleFromString(json['role'] ?? 'client'),
      profilePhoto: json['profile_photo'],
      assignedVehicle: json['assigned_vehicle'],
    );
  }

  /// Convert UserModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'role': roleString,
      'profile_photo': profilePhoto,
      'assigned_vehicle': assignedVehicle,
    };
  }

  /// Create UserModel from User entity
  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      assignedVehicle: user.assignedVehicle,
    );
  }

  /// Convert to User entity
  User toEntity() {
    return User(
      id: id,
      name: name,
      phone: phone,
      email: email,
      role: role,
      profilePhoto: profilePhoto,
      assignedVehicle: assignedVehicle,
    );
  }

  /// CopyWith method for immutability
  UserModel copyWith({
    String? id,
    String? name,
    String? phone,
    String? email,
    UserRole? role,
    String? profilePhoto,
    String? assignedVehicle,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      role: role ?? this.role,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      assignedVehicle: assignedVehicle ?? this.assignedVehicle,
    );
  }
}
