import 'package:equatable/equatable.dart';

/// Base class for all authentication events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// Event when user attempts to login
class LoginRequested extends AuthEvent {
  final String identifier; // Email or phone
  final String password;

  const LoginRequested({
    required this.identifier,
    required this.password,
  });

  @override
  List<Object?> get props => [identifier, password];
}

/// Event when user attempts to logout
class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}

/// Event to check if user is logged in (on app start)
class CheckAuthStatus extends AuthEvent {
  const CheckAuthStatus();
}

/// Event to get current user info
class GetCurrentUser extends AuthEvent {
  const GetCurrentUser();
}
