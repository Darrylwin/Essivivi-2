import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/routing/app_router.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomPointVenteController = TextEditingController();
  final _nomResponsableController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _adresseController = TextEditingController();
  
  String _typeClient = 'detaillant';
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;
  int _currentStep = 0;

  @override
  void dispose() {
    _nomPointVenteController.dispose();
    _nomResponsableController.dispose();
    _telephoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _adresseController.dispose();
    super.dispose();
  }

  void _handleRegister() {
    if (!_acceptTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Veuillez accepter les conditions d\'utilisation'),
          backgroundColor: AppColor.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      return;
    }

    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
            RegisterRequested(
              nomPointVente: _nomPointVenteController.text.trim(),
              nomResponsable: _nomResponsableController.text.trim(),
              telephone: _telephoneController.text.trim(),
              email: _emailController.text.trim(),
              motDePasse: _passwordController.text,
              adresse: _adresseController.text.trim(),
              typeClient: _typeClient,
            ),
          );
    }
  }

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      _handleRegister();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(3, (index) {
          return Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: _currentStep == index ? 32 : 12,
                height: 12,
                decoration: BoxDecoration(
                  color: _currentStep >= index
                      ? AppColor.primary
                      : AppColor.grey300,
                  borderRadius: BorderRadius.circular(6),
                  boxShadow: _currentStep == index
                      ? [
                          BoxShadow(
                            color: AppColor.primary.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
              ),
              if (index < 2)
                Container(
                  width: 40,
                  height: 1,
                  color: AppColor.grey300,
                ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1();
      case 1:
        return _buildStep2();
      case 2:
        return _buildStep3();
      default:
        return const SizedBox();
    }
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        const Text(
          'Informations du point de vente',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColor.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Renseignez les détails de votre établissement',
          style: TextStyle(
            fontSize: 14,
            color: AppColor.textSecondary,
          ),
        ),
        const SizedBox(height: 32),
        
        CustomTextField(
          controller: _nomPointVenteController,
          label: 'Nom du point de vente',
          hint: 'Boutique ESSIVIVI',
          icon: Icons.store_mall_directory_rounded,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Nom du point de vente requis';
            }
            return null;
          },
        ),
        
        const SizedBox(height: 24),
        
        // Type client dropdown
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Type de client',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColor.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: AppColor.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppColor.border,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _typeClient,
                  isExpanded: true,
                  icon: const Icon(Icons.expand_more_rounded),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColor.textPrimary,
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'detaillant',
                      child: Text('Détaillant'),
                    ),
                    DropdownMenuItem(
                      value: 'grossiste',
                      child: Text('Grossiste'),
                    ),
                    DropdownMenuItem(
                      value: 'institution',
                      child: Text('Institution'),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _typeClient = value!;
                    });
                  },
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        CustomTextField(
          controller: _adresseController,
          label: 'Adresse complète',
          hint: 'Rue 15, Quartier Adidogomé, Lomé',
          icon: Icons.location_on_rounded,
          maxLines: 3,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Adresse requise';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        const Text(
          'Informations du responsable',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColor.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Personne en charge du point de vente',
          style: TextStyle(
            fontSize: 14,
            color: AppColor.textSecondary,
          ),
        ),
        const SizedBox(height: 32),
        
        CustomTextField(
          controller: _nomResponsableController,
          label: 'Nom du responsable',
          hint: 'Jean Dupont',
          icon: Icons.person_outline_rounded,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Nom du responsable requis';
            }
            return null;
          },
        ),
        
        const SizedBox(height: 24),
        
        CustomTextField(
          controller: _telephoneController,
          label: 'Téléphone',
          hint: '+22890123456',
          icon: Icons.phone_rounded,
          keyboardType: TextInputType.phone,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Téléphone requis';
            }
            if (value.length < 8) {
              return 'Numéro de téléphone invalide';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        const Text(
          'Informations de connexion',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColor.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Créez vos identifiants de connexion',
          style: TextStyle(
            fontSize: 14,
            color: AppColor.textSecondary,
          ),
        ),
        const SizedBox(height: 32),
        
        CustomTextField(
          controller: _emailController,
          label: 'Adresse email',
          hint: 'exemple@email.com',
          icon: Icons.email_rounded,
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
        
        const SizedBox(height: 24),
        
        CustomTextField(
          controller: _passwordController,
          label: 'Mot de passe',
          hint: '••••••••',
          icon: Icons.lock_rounded,
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
                  ? Icons.visibility_rounded
                  : Icons.visibility_off_rounded,
              color: AppColor.textSecondary,
              size: 20,
            ),
            onPressed: () {
              setState(() {
                _obscurePassword = !_obscurePassword;
              });
            },
          ),
        ),
        
        const SizedBox(height: 24),
        
        CustomTextField(
          controller: _confirmPasswordController,
          label: 'Confirmer le mot de passe',
          hint: '••••••••',
          icon: Icons.lock_reset_rounded,
          obscureText: _obscureConfirmPassword,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Confirmation requise';
            }
            if (value != _passwordController.text) {
              return 'Les mots de passe ne correspondent pas';
            }
            return null;
          },
          suffix: IconButton(
            icon: Icon(
              _obscureConfirmPassword
                  ? Icons.visibility_rounded
                  : Icons.visibility_off_rounded,
              color: AppColor.textSecondary,
              size: 20,
            ),
            onPressed: () {
              setState(() {
                _obscureConfirmPassword = !_obscureConfirmPassword;
              });
            },
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Terms checkbox
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColor.primary.withOpacity(0.03),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColor.primary.withOpacity(0.1),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: _acceptTerms,
                onChanged: (value) {
                  setState(() {
                    _acceptTerms = value!;
                  });
                },
                activeColor: AppColor.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _acceptTerms = !_acceptTerms;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColor.textSecondary,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: 'En cochant cette case, vous acceptez nos ',
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
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor.background,
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is RegistrationOtpSent) {
            context.goToOtp(
              email: state.email,
              fromRegistration: true,
            );
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
            message: 'Création du compte...',
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  pinned: true,
                  expandedHeight: 120,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColor.primary,
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                  leading: Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColor.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_rounded,
                          color: AppColor.textPrimary),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  title: AnimatedOpacity(
                    opacity: _currentStep > 0 ? 1 : 0,
                    duration: const Duration(milliseconds: 300),
                    child: const Text(
                      'Inscription',
                      style: TextStyle(
                        color: AppColor.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Container(
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
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header
                            const Text(
                              'Créer un compte client',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                color: AppColor.textPrimary,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Rejoignez la communauté ESSIVIVI en 3 étapes',
                              style: TextStyle(
                                fontSize: 15,
                                color: AppColor.textSecondary,
                              ),
                            ),
                            
                            // Step indicator
                            _buildStepIndicator(),
                            
                            // Step content
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 300),
                              child: _buildStepContent(),
                            ),
                            
                            const SizedBox(height: 40),
                            
                            // Navigation buttons
                            Row(
                              children: [
                                if (_currentStep > 0)
                                  Expanded(
                                    child: SecondaryButton(
                                      text: 'Retour',
                                      onPressed: _prevStep,
                                      icon: Icons.arrow_back_rounded,
                                      width: null,
                                    ),
                                  ),
                                if (_currentStep > 0) const SizedBox(width: 16),
                                Expanded(
                                  flex: _currentStep == 0 ? 1 : 2,
                                  child: PrimaryButton(
                                    text: _currentStep == 2
                                        ? 'Créer mon compte'
                                        : 'Continuer',
                                    onPressed: _nextStep,
                                    isLoading: isLoading,
                                    icon: _currentStep == 2
                                        ? Icons.check_circle_outline_rounded
                                        : Icons.arrow_forward_rounded,
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 32),
                            
                            // Login link
                            Center(
                              child: GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 20,
                                    vertical: 12,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColor.background,
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: RichText(
                                    text: const TextSpan(
                                      children: [
                                        TextSpan(
                                          text: 'Déjà un compte ? ',
                                          style: TextStyle(
                                            color: AppColor.textSecondary,
                                            fontSize: 14,
                                          ),
                                        ),
                                        TextSpan(
                                          text: 'Se connecter',
                                          style: TextStyle(
                                            color: AppColor.primary,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
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
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}