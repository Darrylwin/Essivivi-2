import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/product.dart';
import '../repositories/order_repository.dart';

/// Use case pour récupérer la liste des produits
class GetProductsUseCase {
  final OrderRepository repository;

  GetProductsUseCase(this.repository);

  /// Execute get products
  Future<Either<Failure, List<Product>>> call() async {
    return await repository.getProducts();
  }
}