import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/resend_otp_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/verify_otp_usecase.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/change_password_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// Authentication BLoC
/// Gère tous les états d'authentification de l'application
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final VerifyOtpUseCase verifyOtpUseCase;
  final RegisterUseCase registerUseCase;
  final ResendOtpUseCase resendOtpUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;
  final ChangePasswordUseCase changePasswordUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.verifyOtpUseCase,
    required this.registerUseCase,
    required this.resendOtpUseCase,
    required this.getCurrentUserUseCase,
    required this.changePasswordUseCase,
    required this.logoutUseCase,
  }) : super(const AuthInitial()) {
    // Enregistrer les handlers pour chaque événement
    on<LoginRequested>(_onLoginRequested);
    on<VerifyOtpRequested>(_onVerifyOtpRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<ResendOtpRequested>(_onResendOtpRequested);
    on<GetCurrentUserRequested>(_onGetCurrentUserRequested);
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<ChangePasswordRequested>(_onChangePasswordRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  // =====================================================
  // Login & OTP Handlers
  // =====================================================

  /// Handler pour le login (étape 1: envoi OTP)
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await loginUseCase(
      LoginParams(
        email: event.email,
        motDePasse: event.motDePasse,
      ),
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (email) => emit(OtpSent(
        email: email,
        userType: 'unknown', // Sera mis à jour après vérification OTP
        message: 'Code OTP envoyé à votre email',
      )),
    );
  }

  /// Handler pour la vérification OTP (étape 2: authentification)
  Future<void> _onVerifyOtpRequested(
    VerifyOtpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await verifyOtpUseCase(
      VerifyOtpParams(
        email: event.email,
        otp: event.otp,
      ),
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  /// Handler pour renvoyer un OTP
  Future<void> _onResendOtpRequested(
    ResendOtpRequested event,
    Emitter<AuthState> emit,
  ) async {
    // Garder l'état actuel pendant le chargement
    final currentState = state;

    final result = await resendOtpUseCase(event.email);

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (_) => emit(const OtpResent('Un nouveau code OTP a été envoyé')),
    );
  }

  // =====================================================
  // Registration Handlers
  // =====================================================

  /// Handler pour l'inscription
  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await registerUseCase(
      RegisterParams(
        nomPointVente: event.nomPointVente,
        nomResponsable: event.nomResponsable,
        telephone: event.telephone,
        email: event.email,
        motDePasse: event.motDePasse,
        adresse: event.adresse,
        latitude: event.latitude,
        longitude: event.longitude,
        typeClient: event.typeClient,
      ),
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (email) => emit(RegistrationOtpSent(
        email: email,
        message: 'Inscription réussie. Un code OTP a été envoyé à votre email.',
      )),
    );
  }

  // =====================================================
  // User Info Handlers
  // =====================================================

  /// Handler pour récupérer l'utilisateur actuel
  Future<void> _onGetCurrentUserRequested(
    GetCurrentUserRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await getCurrentUserUseCase();

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  /// Handler pour vérifier le statut d'authentification au démarrage
  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await getCurrentUserUseCase();

    result.fold(
      (failure) => emit(const AuthUnauthenticated()),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  // =====================================================
  // Profile Management Handlers
  // =====================================================

  /// Handler pour changer le mot de passe
  Future<void> _onChangePasswordRequested(
    ChangePasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await changePasswordUseCase(
      ChangePasswordParams(
        ancienMotDePasse: event.ancienMotDePasse,
        nouveauMotDePasse: event.nouveauMotDePasse,
      ),
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (_) => emit(const AuthOperationSuccess(
        message: 'Mot de passe modifié avec succès',
      )),
    );
  }

  // =====================================================
  // Logout Handler
  // =====================================================

  /// Handler pour la déconnexion
  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await logoutUseCase();

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (_) => emit(const AuthUnauthenticated()),
    );
  }
}