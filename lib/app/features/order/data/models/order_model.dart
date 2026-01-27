import '../../domain/entities/order.dart';

/// Order model - Data layer
class OrderModel extends Order {
  const OrderModel({
    required super.id,
    required super.clientId,
    required super.clientCode,
    required super.clientNom,
    super.agentId,
    super.agentNumero,
    super.agentNom,
    required super.lignes,
    required super.quantiteTotale,
    required super.montantTotal,
    required super.latitudeLivraison,
    required super.longitudeLivraison,
    super.adresseTextuelle,
    required super.statut,
    required super.estAssignee,
    required super.createdAt,
    super.updatedAt,
  });

  /// Create OrderModel from JSON
  factory OrderModel.fromJson(Map<String, dynamic> json) {
    // Parse lignes
    final lignesJson = json['lignes'] as List<dynamic>? ?? [];
    final lignes = lignesJson
        .map((ligneJson) => LigneCommandeModel.fromJson(ligneJson))
        .toList();

    return OrderModel(
      id: json['id'] ?? 0,
      clientId: json['client'] ?? 0,
      clientCode: json['client_code'] ?? '',
      clientNom: json['client_nom'] ?? '',
      agentId: json['agent'],
      agentNumero: json['agent_numero'],
      agentNom: json['agent_nom'],
      lignes: lignes,
      quantiteTotale: json['quantite_totale'] ?? 0,
      montantTotal: double.tryParse(json['montant_total']?.toString() ?? '0') ?? 0.0,
      latitudeLivraison: double.tryParse(json['latitude_livraison']?.toString() ?? '0') ?? 0.0,
      longitudeLivraison: double.tryParse(json['longitude_livraison']?.toString() ?? '0') ?? 0.0,
      adresseTextuelle: json['adresse_textuelle'],
      statut: orderStatusFromString(json['statut'] ?? 'en_attente'),
      estAssignee: json['est_assignee'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  /// Convert OrderModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client': clientId,
      'client_code': clientCode,
      'client_nom': clientNom,
      'agent': agentId,
      'agent_numero': agentNumero,
      'agent_nom': agentNom,
      'lignes': lignes.map((l) => (l as LigneCommandeModel).toJson()).toList(),
      'quantite_totale': quantiteTotale,
      'montant_total': montantTotal.toString(),
      'latitude_livraison': latitudeLivraison.toString(),
      'longitude_livraison': longitudeLivraison.toString(),
      'adresse_textuelle': adresseTextuelle,
      'statut': orderStatusToString(statut),
      'est_assignee': estAssignee,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}

/// LigneCommande model
class LigneCommandeModel extends LigneCommande {
  const LigneCommandeModel({
    required super.id,
    required super.produitId,
    required super.produitNom,
    required super.produitMarque,
    required super.produitVolume,
    required super.quantite,
    required super.prixUnitaire,
    required super.montant,
  });

  /// Create from JSON
  factory LigneCommandeModel.fromJson(Map<String, dynamic> json) {
    // Handle nested produit_detail
    final produitDetail = json['produit_detail'] as Map<String, dynamic>?;

    return LigneCommandeModel(
      id: json['id'] ?? 0,
      produitId: json['produit'] ?? 0,
      produitNom: produitDetail?['nom'] ?? '',
      produitMarque: produitDetail?['marque'] ?? '',
      produitVolume: produitDetail?['volume'] ?? '',
      quantite: json['quantite'] ?? 0,
      prixUnitaire: double.tryParse(json['prix_unitaire']?.toString() ?? '0') ?? 0.0,
      montant: double.tryParse(json['montant']?.toString() ?? '0') ?? 0.0,
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'produit': produitId,
      'produit_detail': {
        'nom': produitNom,
        'marque': produitMarque,
        'volume': produitVolume,
      },
      'quantite': quantite,
      'prix_unitaire': prixUnitaire.toString(),
      'montant': montant.toString(),
    };
  }
}