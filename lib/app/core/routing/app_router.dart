import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_screen.dart';
import '../../features/auth/presentation/pages/otp_screen.dart';
import '../../features/auth/presentation/pages/register_screen.dart';
import '../../features/auth/presentation/pages/splash_screen.dart';
import '../../features/order/presentation/pages/client_home_screen.dart';

class AppRouter {
  static const String splash = '/';
  static const String login = '/login';
  static const String otp = '/otp';
  static const String register = '/register';
  
  // Client routes
  static const String clientHome = '/client/home';
  
  // Agent routes
  static const String agentHome = '/agent/home';

  static GoRouter createRouter() {
    return GoRouter(
      initialLocation: splash,
      debugLogDiagnostics: true,
      
      routes: [
        // =====================================================
        // Auth Routes
        // =====================================================
        GoRoute(
          path: splash,
          name: 'splash',
          builder: (context, state) => const SplashScreen(),
        ),

        GoRoute(
          path: login,
          name: 'login',
          builder: (context, state) => const LoginScreen(),
        ),

        GoRoute(
          path: otp,
          name: 'otp',
          builder: (context, state) {
            final extra = state.extra as Map<String, dynamic>?;
            return OtpScreen(
              email: extra?['email'] ?? '',
              fromRegistration: extra?['fromRegistration'] ?? false,
            );
          },
        ),

        GoRoute(
          path: register,
          name: 'register',
          builder: (context, state) => const RegisterScreen(),
        ),

        // =====================================================
        // Client Routes
        // =====================================================
        GoRoute(
          path: clientHome,
          name: 'clientHome',
          builder: (context, state) => const ClientHomeScreen(),
        ),

        // =====================================================
        // Agent Routes
        // =====================================================
        GoRoute(
          path: agentHome,
          name: 'agentHome',
          builder: (context, state) => const Placeholder(), // TODO: AgentHomeScreen
        ),
      ],

      errorBuilder: (context, state) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 80, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Page non trouvée',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(state.matchedLocation),
            ],
          ),
        ),
      ),
    );
  }
}

// Extensions pour faciliter la navigation
extension GoRouterExtension on BuildContext {
  void goToLogin() => go(AppRouter.login);
  void goToRegister() => go(AppRouter.register);
  
  void goToOtp({
    required String email,
    bool fromRegistration = false,
  }) {
    go(
      AppRouter.otp,
      extra: {
        'email': email,
        'fromRegistration': fromRegistration,
      },
    );
  }
  
  void goToClientHome() => go(AppRouter.clientHome);
  void goToAgentHome() => go(AppRouter.agentHome);
}