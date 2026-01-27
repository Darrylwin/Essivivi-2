import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/routing/app_router.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_state.dart';
import '../../../auth/domain/entities/user.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    
    // Animation setup
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleAuthState(BuildContext context, AuthState state) {
    if (state is AuthAuthenticated) {
      // Naviguer selon le type d'utilisateur
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          if (state.user.userType == UserRole.client) {
            context.go(AppRouter.clientHome);
          } else {
            context.go(AppRouter.agentHome);
          }
        }
      });
    } else if (state is AuthUnauthenticated) {
      // Naviguer vers login
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          context.go(AppRouter.login);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: _handleAuthState,
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: AppColor.primaryGradient,
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo animé
                AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                    return FadeTransition(
                      opacity: _fadeAnimation,
                      child: ScaleTransition(
                        scale: _scaleAnimation,
                        child: const AppLogo(size: 120),
                      ),
                    );
                  },
                ),
                
                const SizedBox(height: 32),
                
                // Nom de l'app
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: const Text(
                    'ESSIVIVI',
                    style: TextStyle(
                      fontSize: 42,
                      fontWeight: FontWeight.bold,
                      color: AppColor.white,
                      letterSpacing: 2,
                    ),
                  ),
                ),
                
                const SizedBox(height: 8),
                
                // Slogan
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: const Text(
                    'Livraison d\'eau à domicile',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColor.white,
                      fontWeight: FontWeight.w300,
                    ),
                  ),
                ),
                
                const SizedBox(height: 80),
                
                // Loading indicator
                const CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(AppColor.white),
                ),
                
                const SizedBox(height: 16),
                
                const Text(
                  'Chargement...',
                  style: TextStyle(
                    color: AppColor.white,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}