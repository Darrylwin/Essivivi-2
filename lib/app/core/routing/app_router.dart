import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../di/service_locator.dart' as di;

// Import des pages d'authentification
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/otp_verification_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';

// TODO: Import your screens when created
// import 'package:your_app/features/order/presentation/screens/client/my_orders_screen.dart';
// import 'package:your_app/features/order/presentation/screens/client/create_order_screen.dart';

class AppRouter {
  static const String login = '/';
  static const String splash = '/splash';
  static const String register = '/register';
  static const String otpVerification = '/otp-verification';
  
  // Client routes
  static const String clientHome = '/client/home';
  static const String myOrders = '/client/orders';
  static const String createOrder = '/client/orders/create';
  static const String orderDetails = '/client/orders/:id';
  static const String clientProfile = '/client/profile';
  
  // Agent routes
  static const String agentHome = '/agent/home';
  static const String assignedOrders = '/agent/orders';
  static const String recordDelivery = '/agent/deliveries/record/:orderId';
  static const String myDeliveries = '/agent/deliveries';
  static const String agentProfile = '/agent/profile';

  /// Create the router configuration
  static GoRouter createRouter() {
    return GoRouter(
      initialLocation: splash,
      debugLogDiagnostics: true,
      
      // Redirect logic for authentication
      redirect: (BuildContext context, GoRouterState state) {
        final authBloc = di.sl.get<AuthBloc>();
        final authState = authBloc.state;
        
        // Routes qui ne nécessitent pas d'authentification
        final publicRoutes = [login, register, otpVerification, splash];
        final isPublicRoute = publicRoutes.contains(state.matchedLocation);
        
        // Si l'utilisateur est authentifié et essaie d'accéder à une route publique
        if (authState is AuthAuthenticated && isPublicRoute) {
          // Rediriger selon le type d'utilisateur
          if (authState.user.isClient) {
            return clientHome;
          } else if (authState.user.isAgent) {
            return agentHome;
          }
        }
        
        // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
        if (authState is! AuthAuthenticated && !isPublicRoute) {
          return login;
        }
        
        return null; // No redirect
      },
      
      routes: [
        // =====================================================
        // Auth Routes
        // =====================================================
        GoRoute(
          path: splash,
          name: 'splash',
          builder: (context, state) {
            // TODO: Create SplashScreen
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          },
        ),

        GoRoute(
          path: login,
          name: 'login',
          builder: (context, state) {
            return const LoginPage();
          },
        ),

        GoRoute(
          path: register,
          name: 'register',
          builder: (context, state) {
            return const RegisterPage();
          },
        ),

        GoRoute(
          path: otpVerification,
          name: 'otpVerification',
          builder: (context, state) {
            final email = state.extra as String? ?? '';
            return OTPVerificationPage(email: email);
          },
        ),

        // =====================================================
        // Client Routes
        // =====================================================
        GoRoute(
          path: clientHome,
          name: 'clientHome',
          builder: (context, state) {
            // TODO: Replace with your ClientHomeScreen
            return Scaffold(
              appBar: AppBar(title: const Text('Tableau de bord Client')),
              body: const Center(child: Text('Interface Client')),
            );
          },
        ),

        GoRoute(
          path: myOrders,
          name: 'myOrders',
          builder: (context, state) {
            // TODO: Replace with your MyOrdersScreen
            return const Placeholder(); // MyOrdersScreen();
          },
        ),

        GoRoute(
          path: createOrder,
          name: 'createOrder',
          builder: (context, state) {
            // TODO: Replace with your CreateOrderScreen
            return const Placeholder(); // CreateOrderScreen();
          },
        ),

        GoRoute(
          path: orderDetails,
          name: 'orderDetails',
          builder: (context, state) {
            final orderId = state.pathParameters['id']!;
            // TODO: Replace with your OrderDetailsScreen
            return const Placeholder(); // OrderDetailsScreen(orderId: orderId);
          },
        ),

        GoRoute(
          path: clientProfile,
          name: 'clientProfile',
          builder: (context, state) {
            // TODO: Replace with your ClientProfileScreen
            return const Placeholder(); // ClientProfileScreen();
          },
        ),

        // =====================================================
        // Agent Routes
        // =====================================================
        GoRoute(
          path: agentHome,
          name: 'agentHome',
          builder: (context, state) {
            // TODO: Replace with your AgentHomeScreen
            return Scaffold(
              appBar: AppBar(title: const Text('Tableau de bord Agent')),
              body: const Center(child: Text('Interface Agent')),
            );
          },
        ),

        GoRoute(
          path: assignedOrders,
          name: 'assignedOrders',
          builder: (context, state) {
            // TODO: Replace with your AssignedOrdersScreen
            return const Placeholder(); // AssignedOrdersScreen();
          },
        ),

        GoRoute(
          path: recordDelivery,
          name: 'recordDelivery',
          builder: (context, state) {
            final orderId = state.pathParameters['orderId']!;
            // TODO: Replace with your RecordDeliveryScreen
            return const Placeholder(); // RecordDeliveryScreen(orderId: orderId);
          },
        ),

        GoRoute(
          path: myDeliveries,
          name: 'myDeliveries',
          builder: (context, state) {
            // TODO: Replace with your MyDeliveriesScreen
            return const Placeholder(); // MyDeliveriesScreen();
          },
        ),

        GoRoute(
          path: agentProfile,
          name: 'agentProfile',
          builder: (context, state) {
            // TODO: Replace with your AgentProfileScreen
            return const Placeholder(); // AgentProfileScreen();
          },
        ),
      ],

      // Error page
      errorBuilder: (context, state) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
              ),
              const SizedBox(height: 20),
              Text(
                'Page non trouvée',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 10),
              Text(
                state.matchedLocation,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => context.go(login),
                child: const Text('Retour à l\'accueil'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Extension for easy navigation
extension GoRouterExtension on BuildContext {
  void goToLogin() => go(AppRouter.login);
  void goToRegister() => go(AppRouter.register);
  void goToOtpVerification(String email) {
    go(AppRouter.otpVerification, extra: email);
  }
  void goToClientHome() => go(AppRouter.clientHome);
  void goToAgentHome() => go(AppRouter.agentHome);
  void goToMyOrders() => go(AppRouter.myOrders);
  void goToCreateOrder() => go(AppRouter.createOrder);
  void goToOrderDetails(String orderId) {
    go(AppRouter.orderDetails.replaceAll(':id', orderId));
  }
  void goToAssignedOrders() => go(AppRouter.assignedOrders);
  void goToRecordDelivery(String orderId) {
    go(AppRouter.recordDelivery.replaceAll(':orderId', orderId));
  }
  void goToMyDeliveries() => go(AppRouter.myDeliveries);
}