import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/app_router.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../domain/entities/user.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';

class LoginPage extends StatefulWidget {
  static const routeName = '/login';

  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoading) {
          setState(() => _isLoading = true);
        } else if (state is OtpSent) {
          setState(() => _isLoading = false);
          // Naviguer vers la page OTP
          context.go(
            AppRouter.otpVerification,
            extra: state.email,
          );
        } else if (state is AuthError) {
          setState(() => _isLoading = false);
          _showErrorSnackBar(context, state.message);
        } else if (state is AuthAuthenticated) {
          setState(() => _isLoading = false);
          _redirectBasedOnUserType(state.user, context);
        }
      },
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColor.primaryLight,
                AppColor.background,
              ],
              stops: [0.0, 0.7],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),

                  // Logo et titre
                  _buildHeader(context),

                  const SizedBox(height: 48),

                  // Formulaire de connexion
                  _buildLoginForm(context),

                  const SizedBox(height: 32),

                  // Bouton d'inscription
                  _buildRegisterSection(context),

                  const SizedBox(height: 48),

                  // Section informations
                  _buildInfoSection(context),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      children: [
        // Logo
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(60),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Center(
            child: Icon(
              Icons.water_drop,
              size: 60,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'ESSIVIVI',
          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.w800,
                shadows: [
                  Shadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Distribution d\'eau potable',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.white.withOpacity(0.9),
                fontWeight: FontWeight.w500,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          'Connectez-vous à votre compte',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white.withOpacity(0.8),
              ),
        ),
      ],
    );
  }

  Widget _buildLoginForm(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Connexion',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              'Entrez vos identifiants pour continuer',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  ),
            ),
            const SizedBox(height: 28),

            // Email
            AuthTextField(
              controller: _emailController,
              labelText: 'Adresse email',
              hintText: 'exemple@email.com',
              prefixIcon: Icons.email_rounded,
              keyboardType: TextInputType.emailAddress,
              autofocus: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer votre email';
                }
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                    .hasMatch(value)) {
                  return 'Email invalide';
                }
                return null;
              },
            ),

            const SizedBox(height: 20),

            // Mot de passe
            AuthTextField(
              controller: _passwordController,
              labelText: 'Mot de passe',
              hintText: '••••••••',
              prefixIcon: Icons.lock_rounded,
              obscureText: _obscurePassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off_rounded
                      : Icons.visibility_rounded,
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                ),
                onPressed: () {
                  setState(() => _obscurePassword = !_obscurePassword);
                },
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer votre mot de passe';
                }
                if (value.length < 6) {
                  return 'Le mot de passe doit contenir au moins 6 caractères';
                }
                return null;
              },
            ),

            const SizedBox(height: 12),

            // Mot de passe oublié
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  // TODO: Implémenter la récupération de mot de passe
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                ),
                child: Text(
                  'Mot de passe oublié ?',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ),

            const SizedBox(height: 28),

            // Bouton de connexion
            AuthButton(
              text: 'Se connecter',
              onPressed: _submitLogin,
              isLoading: _isLoading,
              icon: Icons.arrow_forward_rounded,
            ),

            const SizedBox(height: 4),
          ],
        ),
      ),
    );
  }

  Widget _buildRegisterSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          Text(
            'Vous êtes un client ESSIVIVI ?',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12),
          AuthButton(
            text: 'Créer un compte client',
            onPressed: () => context.go(AppRouter.register),
            backgroundColor: Colors.white,
            foregroundColor: Theme.of(context).colorScheme.primary,
            elevation: 0,
            icon: Icons.person_add_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(
            Icons.info_outline_rounded,
            color: Colors.white.withOpacity(0.9),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Pour les agents commerciaux : utilisez les identifiants fournis par votre administrateur',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.9),
                    fontStyle: FontStyle.italic,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  void _submitLogin() {
    if (_formKey.currentState?.validate() ?? false) {
      FocusScope.of(context).unfocus();
      context.read<AuthBloc>().add(
            LoginRequested(
              email: _emailController.text.trim(),
              motDePasse: _passwordController.text,
            ),
          );
    }
  }

  void _redirectBasedOnUserType(User user, BuildContext context) {
    if (user.isAgent) {
      context.go(AppRouter.agentHome);
    } else if (user.isClient) {
      context.go(AppRouter.clientHome);
    }
  }

  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}