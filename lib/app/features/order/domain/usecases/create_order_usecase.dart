import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

/// Use case pour créer une commande
class CreateOrderUseCase {
  final OrderRepository repository;

  CreateOrderUseCase(this.repository);

  /// Execute create order
  Future<Either<Failure, Order>> call(CreateOrderParams params) async {
    // Validation
    if (params.lignes.isEmpty) {
      return const Left(ValidationFailure('Au moins un produit requis'));
    }

    for (var ligne in params.lignes) {
      if (ligne.quantite <= 0) {
        return const Left(ValidationFailure('La quantité doit être supérieure à 0'));
      }
    }

    if (!params.utiliserCoordonneesClient) {
      if (params.latitudeLivraison == null || params.longitudeLivraison == null) {
        return const Left(ValidationFailure('Coordonnées GPS requises'));
      }

      // Validate GPS coordinates
      if (params.latitudeLivraison! < -90 || params.latitudeLivraison! > 90) {
        return const Left(ValidationFailure('Latitude invalide (-90 à 90)'));
      }
      if (params.longitudeLivraison! < -180 || params.longitudeLivraison! > 180) {
        return const Left(ValidationFailure('Longitude invalide (-180 à 180)'));
      }
    }

    // Call repository
    return await repository.createOrder(
      latitudeLivraison: params.latitudeLivraison ?? 0.0,
      longitudeLivraison: params.longitudeLivraison ?? 0.0,
      utiliserCoordonneesClient: params.utiliserCoordonneesClient,
      adresseTextuelle: params.adresseTextuelle,
      lignes: params.lignes,
    );
  }
}

/// Paramètres pour créer une commande
class CreateOrderParams {
  final double? latitudeLivraison;
  final double? longitudeLivraison;
  final bool utiliserCoordonneesClient;
  final String? adresseTextuelle;
  final List<OrderLineItem> lignes;

  CreateOrderParams({
    this.latitudeLivraison,
    this.longitudeLivraison,
    this.utiliserCoordonneesClient = false,
    this.adresseTextuelle,
    required this.lignes,
  });
}