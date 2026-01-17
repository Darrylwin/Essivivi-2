import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// TODO: Import your screens when created
// import 'package:your_app/features/auth/presentation/screens/login_screen.dart';
// import 'package:your_app/features/order/presentation/screens/client/my_orders_screen.dart';
// import 'package:your_app/features/order/presentation/screens/client/create_order_screen.dart';

class AppRouter {
  static const String login = '/';
  static const String splash = '/splash';
  
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
      initialLocation: login,
      debugLogDiagnostics: true,
      
      // Redirect logic for authentication
      redirect: (BuildContext context, GoRouterState state) {
        // TODO: Implement authentication check
        // final isAuthenticated = checkIfUserIsAuthenticated();
        // final isOnLoginPage = state.matchedLocation == login;
        
        // if (!isAuthenticated && !isOnLoginPage) {
        //   return login;
        // }
        
        // if (isAuthenticated && isOnLoginPage) {
        //   final userRole = getUserRole();
        //   if (userRole == 'client') return clientHome;
        //   if (userRole == 'agent') return agentHome;
        // }
        
        return null; // No redirect
      },
      
      routes: [
        // =====================================================
        // Auth Routes
        // =====================================================
        GoRoute(
          path: login,
          name: 'login',
          builder: (context, state) {
            // TODO: Replace with your LoginScreen
            return const Placeholder(); // LoginScreen();
          },
        ),

        GoRoute(
          path: splash,
          name: 'splash',
          builder: (context, state) {
            // TODO: Replace with your SplashScreen
            return const Placeholder(); // SplashScreen();
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
            return const Placeholder(); // ClientHomeScreen();
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
            return Placeholder(); // OrderDetailsScreen(orderId: orderId);
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
            return const Placeholder(); // AgentHomeScreen();
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
            return Placeholder(); // RecordDeliveryScreen(orderId: orderId);
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
          child: Text('Page non trouvée: ${state.matchedLocation}'),
        ),
      ),
    );
  }
}

// Extension for easy navigation
extension GoRouterExtension on BuildContext {
  void goToLogin() => go(AppRouter.login);
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