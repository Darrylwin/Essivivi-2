import 'package:dartz/dartz.dart';

import '../repositories/auth_repository.dart';
import '../../../../core/error/failures.dart';

/// Use case pour renvoyer un code OTP
class ResendOtpUseCase {
  final AuthRepository repository;

  ResendOtpUseCase(this.repository);

  /// Execute resend OTP
  /// Returns Either<Failure, void>
  Future<Either<Failure, void>> call(String email) async {
    // Validation
    if (email.trim().isEmpty) {
      return const Left(EmptyFieldFailure('Email requis'));
    }

    // Appel au repository
    return await repository.resendOtp(email: email.trim());
  }
}