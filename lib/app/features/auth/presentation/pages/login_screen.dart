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
            // Naviguer vers l'écran OTP
            context.goToOtp(email: state.email);
          } else if (state is AuthAuthenticated) {
            // Naviguer selon le type d'utilisateur
            if (state.user.userType == UserRole.client) {
              context.goToClientHome();
            } else {
              context.goToAgentHome();
            }
          } else if (state is AuthError) {
            // Afficher l'erreur
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColor.error,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return LoadingOverlay(
            isLoading: isLoading,
            child: SingleChildScrollView(
              child: Container(
                height: MediaQuery.of(context).size.height,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColor.primary,
                      AppColor.primaryLight,
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    children: [
                      const Spacer(flex: 1),
                      
                      // Logo
                      const AppLogo(size: 100),
                      
                      const SizedBox(height: 24),
                      
                      const Text(
                        'ESSIVIVI',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: AppColor.white,
                          letterSpacing: 2,
                        ),
                      ),
                      
                      const SizedBox(height: 8),
                      
                      const Text(
                        'Bienvenue !',
                        style: TextStyle(
                          fontSize: 18,
                          color: AppColor.white,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                      
                      const Spacer(flex: 2),
                      
                      // Form card
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: const BoxDecoration(
                          color: AppColor.white,
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(32),
                            topRight: Radius.circular(32),
                          ),
                        ),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Titre
                              const Text(
                                'Connexion',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: AppColor.textPrimary,
                                ),
                              ),
                              
                              const SizedBox(height: 8),
                              
                              const Text(
                                'Entrez vos identifiants pour continuer',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: AppColor.textSecondary,
                                ),
                              ),
                              
                              const SizedBox(height: 32),
                              
                              // Email field
                              CustomTextField(
                                controller: _emailController,
                                label: 'Email',
                                hint: 'exemple@email.com',
                                icon: Icons.email_outlined,
                                keyboardType: TextInputType.emailAddress,
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
                              
                              const SizedBox(height: 20),
                              
                              // Password field
                              CustomTextField(
                                controller: _passwordController,
                                label: 'Mot de passe',
                                hint: '••••••••',
                                icon: Icons.lock_outline,
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
                                        : Icons.visibility_off_outlined,
                                    color: AppColor.textSecondary,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                ),
                              ),
                              
                              const SizedBox(height: 32),
                              
                              // Login button
                              PrimaryButton(
                                text: 'Se connecter',
                                onPressed: _handleLogin,
                                isLoading: isLoading,
                                icon: Icons.login,
                              ),
                              
                              const SizedBox(height: 24),
                              
                              // Divider
                              const Row(
                                children: [
                                  Expanded(
                                    child: Divider(
                                      color: AppColor.grey300,
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 16,
                                    ),
                                    child: Text(
                                      'OU',
                                      style: TextStyle(
                                        color: AppColor.textSecondary,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Divider(
                                      color: AppColor.grey300,
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
                                icon: Icons.person_add_outlined,
                              ),
                              
                              const SizedBox(height: 32),
                              
                              // Info text
                              Center(
                                child: RichText(
                                  textAlign: TextAlign.center,
                                  text: const TextSpan(
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColor.textSecondary,
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
                                      TextSpan(text: ' et notre '),
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
                              
                              const SizedBox(height: 16),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}