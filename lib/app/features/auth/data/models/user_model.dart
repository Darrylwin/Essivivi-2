import '../../domain/entities/user.dart';

/// User model - Data layer
/// Extends User entity et ajoute la sérialisation JSON
class UserModel extends User {
  const UserModel({
    required super.id,
    required super.email,
    required super.userType,
    required super.telephone,
    required super.statut,
    required super.dateInscription,
    super.photoUrl,
    super.nomPointVente,
    super.nomResponsable,
    super.codeClient,
    super.adresse,
    super.latitude,
    super.longitude,
    super.typeClient,
    super.nom,
    super.prenom,
    super.numeroIdentification,
    super.dateNaissance,
    super.tricycle,
  });

  /// Create UserModel from JSON (API response)
  factory UserModel.fromJson(Map<String, dynamic> json, String userType) {
    final type = userRoleFromString(userType);

    if (type == UserRole.client) {
      // Format pour les clients
      return UserModel(
        id: json['id'] ?? 0,
        email: json['email'] ?? '',
        userType: UserRole.client,
        telephone: json['telephone'] ?? '',
        statut: json['statut'] ?? 'actif',
        dateInscription: json['date_inscription'] != null
            ? DateTime.parse(json['date_inscription'])
            : DateTime.now(),
        photoUrl: json['photo_url'],
        nomPointVente: json['nom_point_vente'] ?? '',
        nomResponsable: json['nom_responsable'] ?? '',
        codeClient: json['code_client'] ?? '',
        adresse: json['adresse'] ?? '',
        latitude: json['latitude'] != null
            ? double.tryParse(json['latitude'].toString())
            : null,
        longitude: json['longitude'] != null
            ? double.tryParse(json['longitude'].toString())
            : null,
        typeClient: json['type_client'] ?? '',
      );
    } else {
      // Format pour les agents
      return UserModel(
        id: json['id'] ?? 0,
        email: json['email'] ?? '',
        userType: UserRole.agent,
        telephone: json['telephone'] ?? '',
        statut: json['statut'] ?? 'actif',
        dateInscription: json['date_inscription'] != null
            ? DateTime.parse(json['date_inscription'])
            : DateTime.now(),
        photoUrl: json['photo_url'],
        nom: json['nom'] ?? '',
        prenom: json['prenom'] ?? '',
        numeroIdentification: json['numero_identification'] ?? '',
        dateNaissance: json['date_naissance'] ?? '',
        adresse: json['adresse'] ?? '',
        tricycle: json['tricycle'] ?? '',
      );
    }
  }

  /// Convert UserModel to JSON
  Map<String, dynamic> toJson() {
    if (isClient) {
      return {
        'id': id,
        'email': email,
        'user_type': 'client',
        'telephone': telephone,
        'statut': statut,
        'date_inscription': dateInscription.toIso8601String(),
        'photo_url': photoUrl,
        'nom_point_vente': nomPointVente,
        'nom_responsable': nomResponsable,
        'code_client': codeClient,
        'adresse': adresse,
        'latitude': latitude,
        'longitude': longitude,
        'type_client': typeClient,
      };
    } else {
      return {
        'id': id,
        'email': email,
        'user_type': 'agent',
        'telephone': telephone,
        'statut': statut,
        'date_inscription': dateInscription.toIso8601String(),
        'photo_url': photoUrl,
        'nom': nom,
        'prenom': prenom,
        'numero_identification': numeroIdentification,
        'date_naissance': dateNaissance,
        'adresse': adresse,
        'tricycle': tricycle,
      };
    }
  }

  /// Create UserModel from User entity
  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      email: user.email,
      userType: user.userType,
      telephone: user.telephone,
      statut: user.statut,
      dateInscription: user.dateInscription,
      photoUrl: user.photoUrl,
      nomPointVente: user.nomPointVente,
      nomResponsable: user.nomResponsable,
      codeClient: user.codeClient,
      adresse: user.adresse,
      latitude: user.latitude,
      longitude: user.longitude,
      typeClient: user.typeClient,
      nom: user.nom,
      prenom: user.prenom,
      numeroIdentification: user.numeroIdentification,
      dateNaissance: user.dateNaissance,
      tricycle: user.tricycle,
    );
  }

  /// Convert to User entity
  User toEntity() {
    return User(
      id: id,
      email: email,
      userType: userType,
      telephone: telephone,
      statut: statut,
      dateInscription: dateInscription,
      photoUrl: photoUrl,
      nomPointVente: nomPointVente,
      nomResponsable: nomResponsable,
      codeClient: codeClient,
      adresse: adresse,
      latitude: latitude,
      longitude: longitude,
      typeClient: typeClient,
      nom: nom,
      prenom: prenom,
      numeroIdentification: numeroIdentification,
      dateNaissance: dateNaissance,
      tricycle: tricycle,
    );
  }
}