import 'package:equatable/equatable.dart';

/// Order entity - Domain layer
class Order extends Equatable {
  final int id;
  final int clientId;
  final String clientCode;
  final String clientNom;
  final int? agentId;
  final String? agentNumero;
  final String? agentNom;
  final List<LigneCommande> lignes;
  final int quantiteTotale;
  final double montantTotal;
  final double latitudeLivraison;
  final double longitudeLivraison;
  final String? adresseTextuelle;
  final OrderStatus statut;
  final bool estAssignee;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Order({
    required this.id,
    required this.clientId,
    required this.clientCode,
    required this.clientNom,
    this.agentId,
    this.agentNumero,
    this.agentNom,
    required this.lignes,
    required this.quantiteTotale,
    required this.montantTotal,
    required this.latitudeLivraison,
    required this.longitudeLivraison,
    this.adresseTextuelle,
    required this.statut,
    required this.estAssignee,
    required this.createdAt,
    this.updatedAt,
  });

  /// Get status display name (French)
  String get statusDisplayName {
    switch (statut) {
      case OrderStatus.enAttente:
        return 'En attente';
      case OrderStatus.acceptee:
        return 'Acceptée';
      case OrderStatus.enCours:
        return 'En cours';
      case OrderStatus.livree:
        return 'Livrée';
      case OrderStatus.annulee:
        return 'Annulée';
    }
  }

  /// Get status icon
  String get statusIcon {
    switch (statut) {
      case OrderStatus.enAttente:
        return '⏳';
      case OrderStatus.acceptee:
        return '✅';
      case OrderStatus.enCours:
        return '🚚';
      case OrderStatus.livree:
        return '✨';
      case OrderStatus.annulee:
        return '❌';
    }
  }

  /// Check if order can be modified
  bool get canBeModified => statut == OrderStatus.enAttente;

  /// Check if order is completed
  bool get isCompleted => statut == OrderStatus.livree || statut == OrderStatus.annulee;

  @override
  List<Object?> get props => [
        id,
        clientId,
        clientCode,
        clientNom,
        agentId,
        agentNumero,
        agentNom,
        lignes,
        quantiteTotale,
        montantTotal,
        latitudeLivraison,
        longitudeLivraison,
        adresseTextuelle,
        statut,
        estAssignee,
        createdAt,
        updatedAt,
      ];
}

/// Ligne de commande (produit + quantité)
class LigneCommande extends Equatable {
  final int id;
  final int produitId;
  final String produitNom;
  final String produitMarque;
  final String produitVolume;
  final int quantite;
  final double prixUnitaire;
  final double montant;

  const LigneCommande({
    required this.id,
    required this.produitId,
    required this.produitNom,
    required this.produitMarque,
    required this.produitVolume,
    required this.quantite,
    required this.prixUnitaire,
    required this.montant,
  });

  /// Get display name
  String get displayName => '$produitNom $produitVolume';

  @override
  List<Object?> get props => [
        id,
        produitId,
        produitNom,
        produitMarque,
        produitVolume,
        quantite,
        prixUnitaire,
        montant,
      ];
}

/// Order status enum
enum OrderStatus {
  enAttente,  // Client a créé, pas encore assignée
  acceptee,   // Admin a assigné à un agent
  enCours,    // Agent en tournée
  livree,     // Totalement livrée
  annulee,    // Annulée
}

/// Helper to parse status from string
OrderStatus orderStatusFromString(String status) {
  switch (status.toLowerCase()) {
    case 'en_attente':
      return OrderStatus.enAttente;
    case 'acceptee':
      return OrderStatus.acceptee;
    case 'en_cours':
      return OrderStatus.enCours;
    case 'livree':
      return OrderStatus.livree;
    case 'annulee':
      return OrderStatus.annulee;
    default:
      return OrderStatus.enAttente;
  }
}

/// Helper to convert status to string
String orderStatusToString(OrderStatus status) {
  switch (status) {
    case OrderStatus.enAttente:
      return 'en_attente';
    case OrderStatus.acceptee:
      return 'acceptee';
    case OrderStatus.enCours:
      return 'en_cours';
    case OrderStatus.livree:
      return 'livree';
    case OrderStatus.annulee:
      return 'annulee';
  }
}