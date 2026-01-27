import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Use case pour récupérer les informations de l'utilisateur connecté
class GetCurrentUserUseCase {
  final AuthRepository repository;

  GetCurrentUserUseCase(this.repository);

  /// Execute get current user
  /// Returns Either<Failure, User>
  Future<Either<Failure, User>> call() async {
    return await repository.getCurrentUserInfo();
  }
}