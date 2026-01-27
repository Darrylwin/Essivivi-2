import '../../domain/entities/product.dart';

/// Product model - Data layer
class ProductModel extends Product {
  const ProductModel({
    required super.id,
    required super.categorieId,
    required super.categorieNom,
    required super.nom,
    required super.marque,
    required super.volume,
    required super.uniteVente,
    required super.prixUnitaire,
    super.photo,
    required super.actif,
    required super.createdAt,
  });

  /// Create ProductModel from JSON
  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] ?? 0,
      categorieId: json['categorie'] ?? 0,
      categorieNom: json['categorie_nom'] ?? '',
      nom: json['nom'] ?? '',
      marque: json['marque'] ?? '',
      volume: json['volume'] ?? '',
      uniteVente: json['unite_vente'] ?? '',
      prixUnitaire: double.tryParse(json['prix_unitaire']?.toString() ?? '0') ?? 0.0,
      photo: json['photo'],
      actif: json['actif'] ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  /// Convert ProductModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'categorie': categorieId,
      'categorie_nom': categorieNom,
      'nom': nom,
      'marque': marque,
      'volume': volume,
      'unite_vente': uniteVente,
      'prix_unitaire': prixUnitaire.toString(),
      'photo': photo,
      'actif': actif,
      'created_at': createdAt.toIso8601String(),
    };
  }
}