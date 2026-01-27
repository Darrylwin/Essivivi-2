import 'package:equatable/equatable.dart';

/// User entity - Domain layer
/// Représente un utilisateur (Client ou Agent) dans le domaine
class User extends Equatable {
  final int id;
  final String email;
  final UserRole userType;
  
  // Informations communes
  final String telephone;
  final String statut;
  final DateTime dateInscription;
  final String? photoUrl;
  
  // Champs spécifiques Client
  final String? nomPointVente;
  final String? nomResponsable;
  final String? codeClient;
  final String? adresse;
  final double? latitude;
  final double? longitude;
  final String? typeClient;
  
  // Champs spécifiques Agent
  final String? nom;
  final String? prenom;
  final String? numeroIdentification;
  final String? dateNaissance;
  final String? tricycle;

  const User({
    required this.id,
    required this.email,
    required this.userType,
    required this.telephone,
    required this.statut,
    required this.dateInscription,
    this.photoUrl,
    // Client fields
    this.nomPointVente,
    this.nomResponsable,
    this.codeClient,
    this.adresse,
    this.latitude,
    this.longitude,
    this.typeClient,
    // Agent fields
    this.nom,
    this.prenom,
    this.numeroIdentification,
    this.dateNaissance,
    this.tricycle,
  });

  /// Check if user is client
  bool get isClient => userType == UserRole.client;

  /// Check if user is agent
  bool get isAgent => userType == UserRole.agent;

  /// Get display name
  String get displayName {
    if (isClient) {
      return nomPointVente ?? nomResponsable ?? email;
    } else {
      return '$prenom $nom';
    }
  }

  /// Get user identifier code
  String get identifierCode {
    if (isClient) {
      return codeClient ?? '';
    } else {
      return numeroIdentification ?? '';
    }
  }

  @override
  List<Object?> get props => [
        id,
        email,
        userType,
        telephone,
        statut,
        dateInscription,
        photoUrl,
        nomPointVente,
        nomResponsable,
        codeClient,
        adresse,
        latitude,
        longitude,
        typeClient,
        nom,
        prenom,
        numeroIdentification,
        dateNaissance,
        tricycle,
      ];
}

/// User role enum
enum UserRole {
  client,
  agent,
}

/// Helper to parse role from string
UserRole userRoleFromString(String role) {
  switch (role.toLowerCase()) {
    case 'client':
      return UserRole.client;
    case 'agent':
      return UserRole.agent;
    default:
      throw ArgumentError('Invalid user type: $role');
  }
}

/// Helper to convert role to string
String userRoleToString(UserRole role) {
  switch (role) {
    case UserRole.client:
      return 'client';
    case UserRole.agent:
      return 'agent';
  }
}