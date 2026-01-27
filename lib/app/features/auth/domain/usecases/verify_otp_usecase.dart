import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Use case pour vérifier le code OTP (étape 2: authentification complète)
class VerifyOtpUseCase {
  final AuthRepository repository;

  VerifyOtpUseCase(this.repository);

  /// Execute OTP verification
  /// Returns Either<Failure, User>
  Future<Either<Failure, User>> call(VerifyOtpParams params) async {
    // Validation des inputs
    if (params.email.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Email requis'));
    }

    if (params.otp.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Code OTP requis'));
    }

    if (params.otp.trim().length != 6) {
      return const Left(ValidationFailure('Le code OTP doit contenir 6 chiffres'));
    }

    // Appel au repository
    final result = await repository.verifyOtp(
      email: params.email.trim(),
      otp: params.otp.trim(),
    );

    return result.fold(
      (failure) => Left(failure),
      (data) {
        // data contient {'user': User, 'tokens': {...}}
        return Right(data['user'] as User);
      },
    );
  }
}

/// Paramètres pour la vérification OTP
class VerifyOtpParams {
  final String email;
  final String otp;

  VerifyOtpParams({
    required this.email,
    required this.otp,
  });
}