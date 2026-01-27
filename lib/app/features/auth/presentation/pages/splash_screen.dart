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
  late Animation<double> _textAnimation;
  late Animation<double> _gradientAnimation;

  @override
  void initState() {
    super.initState();

    // Enhanced animation setup
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    // CORRECTION : Utiliser Tween simple au lieu de TweenSequence
    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.7, curve: Curves.elasticOut),
      ),
    );

    _textAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.4, 1.0, curve: Curves.easeInOut),
      ),
    );

    _gradientAnimation = Tween<double>(begin: 0.7, end: 0.95).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
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
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) {
          if (state.user.userType == UserRole.client) {
            context.go(AppRouter.clientHome);
          } else {
            context.go(AppRouter.agentHome);
          }
        }
      });
    } else if (state is AuthUnauthenticated) {
      Future.delayed(const Duration(milliseconds: 800), () {
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
        body: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColor.primary.withOpacity(_gradientAnimation.value),
                    AppColor.primaryLight,
                  ],
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Animated logo with water waves
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        // Outer glow
                        Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColor.white.withOpacity(
                              0.1 * _fadeAnimation.value,
                            ),
                          ),
                        ),
                        
                        // Logo with animation
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: ScaleTransition(
                            scale: _scaleAnimation,
                            child: const AppLogo(size: 140, animate: true),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // App name with animation
                    FadeTransition(
                      opacity: _textAnimation,
                      child: Transform.translate(
                        offset: Offset(0, 20 * (1 - _textAnimation.value)),
                        child: ShaderMask(
                          shaderCallback: (bounds) {
                            return const LinearGradient(
                              colors: [
                                AppColor.white,
                                Color(0xFFA5D8FF),
                              ],
                            ).createShader(bounds);
                          },
                          child: const Text(
                            'ESSIVIVI',
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.5,
                              shadows: [
                                Shadow(
                                  color: Colors.black12,
                                  blurRadius: 10,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Tagline with animation
                    FadeTransition(
                      opacity: _textAnimation,
                      child: Transform.translate(
                        offset: Offset(0, 20 * (1 - _textAnimation.value)),
                        child: const Text(
                          'L\'eau pure, à votre service',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColor.white,
                            fontWeight: FontWeight.w300,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 80),
                    
                    // Enhanced loading indicator
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 50,
                                height: 50,
                                child: CircularProgressIndicator(
                                  value: _controller.value <= 1.0 ? _controller.value : 1.0, // CORRECTION
                                  strokeWidth: 2,
                                  color: AppColor.white.withOpacity(0.3),
                                ),
                              ),
                              Container(
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColor.white.withOpacity(0.1),
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.water_drop_outlined,
                                    color: AppColor.white,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Initialisation...',
                            style: TextStyle(
                              color: AppColor.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w300,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}