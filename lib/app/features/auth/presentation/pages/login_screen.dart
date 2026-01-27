import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/routing/app_router.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../../../auth/domain/entities/user.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
            LoginRequested(
              email: _emailController.text.trim(),
              motDePasse: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is OtpSent) {
            context.goToOtp(email: state.email);
          } else if (state is AuthAuthenticated) {
            if (state.user.userType == UserRole.client) {
              context.goToClientHome();
            } else {
              context.goToAgentHome();
            }
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColor.error,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return LoadingOverlay(
            isLoading: isLoading,
            message: 'Connexion en cours...',
            child: Stack(
              children: [
                // Background with gradient
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        AppColor.primary,
                        AppColor.primaryLight,
                        Color(0xFFE3F2FD),
                      ],
                    ),
                  ),
                ),

                // Decorative elements
                Positioned(
                  top: -100,
                  right: -100,
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColor.white.withOpacity(0.05),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -150,
                  left: -100,
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColor.secondary.withOpacity(0.05),
                    ),
                  ),
                ),

                // Main content
                SafeArea(
                  child: SingleChildScrollView(
                    child: SizedBox(
                      height: MediaQuery.of(context).size.height -
                          MediaQuery.of(context).padding.top,
                      child: Column(
                        children: [
                          // Header section
                          const Expanded(
                            flex: 2,
                            child: Padding(
                              padding: EdgeInsets.all(40),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  AppLogo(
                                    size: 80,
                                    animate: true,
                                  ),
                                  SizedBox(height: 24),
                                  Text(
                                    'ESSIVIVI',
                                    style: TextStyle(
                                      fontSize: 36,
                                      fontWeight: FontWeight.w800,
                                      color: AppColor.white,
                                      letterSpacing: 1.2,
                                      shadows: [
                                        Shadow(
                                          color: Colors.black12,
                                          blurRadius: 10,
                                          offset: Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  Text(
                                    'L\'excellence hydrique',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: AppColor.white,
                                      fontWeight: FontWeight.w300,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Form section
                          Expanded(
                            flex: 3,
                            child: Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColor.white,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(40),
                                  topRight: Radius.circular(40),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 40,
                                    offset: const Offset(0, -10),
                                  ),
                                ],
                              ),
                              child: SingleChildScrollView(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 32,
                                  vertical: 40,
                                ),
                                child: Form(
                                  key: _formKey,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Form header
                                      const Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Connexion',
                                            style: TextStyle(
                                              fontSize: 28,
                                              fontWeight: FontWeight.w800,
                                              color: AppColor.textPrimary,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                          SizedBox(height: 8),
                                          Text(
                                            'Accédez à votre compte',
                                            style: TextStyle(
                                              fontSize: 15,
                                              color: AppColor.textSecondary,
                                              fontWeight: FontWeight.w400,
                                            ),
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 40),

                                      // Email field
                                      CustomTextField(
                                        controller: _emailController,
                                        label: 'Adresse email',
                                        hint: 'votre@email.com',
                                        icon: Icons.email_outlined,
                                        keyboardType:
                                            TextInputType.emailAddress,
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Email requis';
                                          }
                                          if (!value.contains('@')) {
                                            return 'Email invalide';
                                          }
                                          return null;
                                        },
                                      ),

                                      const SizedBox(height: 24),

                                      // Password field
                                      CustomTextField(
                                        controller: _passwordController,
                                        label: 'Mot de passe',
                                        hint: '••••••••',
                                        icon: Icons.lock_outline_rounded,
                                        obscureText: _obscurePassword,
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Mot de passe requis';
                                          }
                                          if (value.length < 6) {
                                            return 'Au moins 6 caractères';
                                          }
                                          return null;
                                        },
                                        suffix: IconButton(
                                          icon: Icon(
                                            _obscurePassword
                                                ? Icons.visibility_outlined
                                                : Icons
                                                    .visibility_off_outlined,
                                            color: AppColor.textSecondary,
                                            size: 20,
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              _obscurePassword =
                                                  !_obscurePassword;
                                            });
                                          },
                                          padding: EdgeInsets.zero,
                                          constraints: const BoxConstraints(
                                            minWidth: 40,
                                            minHeight: 40,
                                          ),
                                        ),
                                      ),

                                      const SizedBox(height: 32),

                                      // Login button
                                      PrimaryButton(
                                        text: 'Se connecter',
                                        onPressed: _handleLogin,
                                        isLoading: isLoading,
                                        icon: Icons.arrow_forward_rounded,
                                      ),

                                      const SizedBox(height: 32),

                                      // Divider
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Container(
                                              height: 1,
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  colors: [
                                                    AppColor.border
                                                        .withOpacity(0),
                                                    AppColor.border,
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                          const Padding(
                                            padding: EdgeInsets.symmetric(
                                              horizontal: 16,
                                            ),
                                            child: Text(
                                              'Ou continuer avec',
                                              style: TextStyle(
                                                color: AppColor.textSecondary,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            child: Container(
                                              height: 1,
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  colors: [
                                                    AppColor.border,
                                                    AppColor.border
                                                        .withOpacity(0),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 24),

                                      // Register button
                                      SecondaryButton(
                                        text: 'Créer un compte',
                                        onPressed: () {
                                          context.goToRegister();
                                        },
                                        icon: Icons.person_add_alt_1_rounded,
                                      ),

                                      const SizedBox(height: 40),

                                      // Terms and privacy
                                      Center(
                                        child: RichText(
                                          textAlign: TextAlign.center,
                                          text: const TextSpan(
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: AppColor.textSecondary,
                                              height: 1.5,
                                            ),
                                            children: [
                                              TextSpan(
                                                text:
                                                    'En vous connectant, vous acceptez nos\n',
                                              ),
                                              TextSpan(
                                                text: 'Conditions d\'utilisation',
                                                style: TextStyle(
                                                  color: AppColor.primary,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                              TextSpan(text: ' et '),
                                              TextSpan(
                                                text: 'Politique de confidentialité',
                                                style: TextStyle(
                                                  color: AppColor.primary,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}