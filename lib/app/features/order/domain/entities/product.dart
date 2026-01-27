import 'package:equatable/equatable.dart';

/// Product entity - Domain layer
class Product extends Equatable {
  final int id;
  final int categorieId;
  final String categorieNom;
  final String nom;
  final String marque;
  final String volume;
  final String uniteVente;
  final double prixUnitaire;
  final String? photo;
  final bool actif;
  final DateTime createdAt;

  const Product({
    required this.id,
    required this.categorieId,
    required this.categorieNom,
    required this.nom,
    required this.marque,
    required this.volume,
    required this.uniteVente,
    required this.prixUnitaire,
    this.photo,
    required this.actif,
    required this.createdAt,
  });

  /// Get display name
  String get displayName => '$nom $volume';

  /// Get full name with brand
  String get fullName => '$marque $nom $volume';

  @override
  List<Object?> get props => [
        id,
        categorieId,
        categorieNom,
        nom,
        marque,
        volume,
        uniteVente,
        prixUnitaire,
        photo,
        actif,
        createdAt,
      ];
}