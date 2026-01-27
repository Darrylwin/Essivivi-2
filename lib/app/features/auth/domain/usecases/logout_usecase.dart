import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

/// Use case pour la déconnexion
class LogoutUseCase {
  final AuthRepository repository;

  LogoutUseCase(this.repository);

  /// Execute logout
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> call() async {
    return await repository.logout();
  }
}