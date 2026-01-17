import 'package:equatable/equatable.dart';

/// User entity - Domain layer
class User extends Equatable {
  final String id;
  final String name;
  final String phone;
  final String email;
  final UserRole role;
  final String? profilePhoto;
  final String? assignedVehicle; // Pour Agent uniquement

  const User({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.role,
    this.profilePhoto,
    this.assignedVehicle,
  });

  /// Check if user is client
  bool get isClient => role == UserRole.client;

  /// Check if user is agent
  bool get isAgent => role == UserRole.agent;

  /// Check if user is admin
  bool get isAdmin => role == UserRole.admin;

  /// Get role as string
  String get roleString {
    switch (role) {
      case UserRole.client:
        return 'client';
      case UserRole.agent:
        return 'agent';
      case UserRole.admin:
        return 'admin';
    }
  }

  @override
  List<Object?> get props => [
        id,
        name,
        phone,
        email,
        role,
        profilePhoto,
        assignedVehicle,
      ];
}

/// User role enum
enum UserRole {
  client,
  agent,
  admin,
}

/// Helper to parse role from string
UserRole userRoleFromString(String role) {
  switch (role.toLowerCase()) {
    case 'client':
      return UserRole.client;
    case 'agent':
      return UserRole.agent;
    case 'admin':
      return UserRole.admin;
    default:
      throw ArgumentError('Invalid role: $role');
  }
}
