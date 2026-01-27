import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';

import '../../../../core/routing/app_router.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../features/auth/presentation/bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';

class RegisterPage extends StatefulWidget {
  static const routeName = '/register';

  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _pointDeVenteController = TextEditingController();
  final _responsableController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _adresseController = TextEditingController();
  
  String? _selectedClientType;
  double? _latitude;
  double? _longitude;
  bool _isLoading = false;
  bool _isGettingLocation = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  final List<Map<String, dynamic>> _clientTypes = [
    {
      'value': 'detaillant',
      'label': 'Détaillant',
      'icon': Icons.storefront_rounded,
      'description': 'Commerce de détail'
    },
    {
      'value': 'grossiste',
      'label': 'Grossiste',
      'icon': Icons.inventory_2_rounded,
      'description': 'Vente en gros'
    },
    {
      'value': 'institution',
      'label': 'Institution',
      'icon': Icons.business_rounded,
      'description': 'Établissement public/privé'
    },
  ];

  @override
  void dispose() {
    _pointDeVenteController.dispose();
    _responsableController.dispose();
    _telephoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _adresseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoading) {
          setState(() => _isLoading = true);
        } else if (state is RegistrationOtpSent) {
          setState(() => _isLoading = false);
          // Naviguer vers la page OTP pour l'inscription
          context.go(
            AppRouter.otpVerification,
            extra: state.email,
          );
        } else if (state is AuthError) {
          setState(() => _isLoading = false);
          _showErrorSnackBar(context, state.message);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Inscription Client'),
          centerTitle: true,
          elevation: 0,
        ),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColor.primaryLight,
                AppColor.background,
              ],
              stops: [0.0, 0.3],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  _buildHeader(context),
                  
                  const SizedBox(height: 32),
                  
                  // Formulaire d'inscription
                  _buildRegistrationForm(context),
                  
                  const SizedBox(height: 32),
                  
                  // Bouton d'inscription
                  AuthButton(
                    text: 'Créer mon compte',
                    onPressed: _submitRegistration,
                    isLoading: _isLoading,
                    icon: Icons.person_add_alt_1_rounded,
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Lien vers connexion
                  _buildLoginLink(context),
                  
                  const SizedBox(height: 32),
                  
                  // Conditions d'utilisation
                  _buildTermsSection(context),
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
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(40),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Center(
            child: Icon(
              Icons.person_add_alt_1_rounded,
              size: 40,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          'Devenir client ESSIVIVI',
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Créez votre compte pour commander facilement',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.white.withOpacity(0.9),
              ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildRegistrationForm(BuildContext context) {
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
              'Informations du point de vente',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              'Remplissez les informations ci-dessous',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  ),
            ),
            
            const SizedBox(height: 28),
            
            // Nom du point de vente
            AuthTextField(
              controller: _pointDeVenteController,
              labelText: 'Nom du point de vente',
              hintText: 'Ex: Boulangerie du Marché',
              prefixIcon: Icons.storefront_rounded,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer le nom du point de vente';
                }
                if (value.length < 3) {
                  return 'Le nom doit contenir au moins 3 caractères';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 20),
            
            // Responsable
            AuthTextField(
              controller: _responsableController,
              labelText: 'Nom du responsable',
              hintText: 'Ex: Jean Dupont',
              prefixIcon: Icons.person_outline_rounded,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer le nom du responsable';
                }
                if (value.length < 2) {
                  return 'Le nom doit contenir au moins 2 caractères';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 20),
            
            // Téléphone
            AuthTextField(
              controller: _telephoneController,
              labelText: 'Numéro de téléphone',
              hintText: 'Ex: 90 12 34 56',
              prefixIcon: Icons.phone_rounded,
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer votre numéro de téléphone';
                }
                final cleaned = value.replaceAll(RegExp(r'[^\d+]'), '');
                if (cleaned.length < 8) {
                  return 'Numéro de téléphone invalide';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 20),
            
            // Email
            AuthTextField(
              controller: _emailController,
              labelText: 'Adresse email',
              hintText: 'exemple@email.com',
              prefixIcon: Icons.email_rounded,
              keyboardType: TextInputType.emailAddress,
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
              hintText: 'Minimum 6 caractères',
              prefixIcon: Icons.lock_outline_rounded,
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
                  return 'Veuillez entrer un mot de passe';
                }
                if (value.length < 6) {
                  return 'Le mot de passe doit contenir au moins 6 caractères';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 20),
            
            // Confirmation mot de passe
            AuthTextField(
              controller: _confirmPasswordController,
              labelText: 'Confirmer le mot de passe',
              hintText: 'Ressaisissez votre mot de passe',
              prefixIcon: Icons.lock_reset_rounded,
              obscureText: _obscureConfirmPassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility_off_rounded
                      : Icons.visibility_rounded,
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                ),
                onPressed: () {
                  setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
                },
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez confirmer votre mot de passe';
                }
                if (value != _passwordController.text) {
                  return 'Les mots de passe ne correspondent pas';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 20),
            
            // Adresse
            AuthTextField(
              controller: _adresseController,
              labelText: 'Adresse complète',
              hintText: 'Ex: Rue du Marché, Quartier Administratif',
              prefixIcon: Icons.location_on_rounded,
              maxLines: 2,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer votre adresse';
                }
                if (value.length < 10) {
                  return 'Veuillez fournir une adresse complète';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 20),
            
            // Type de client
            _buildClientTypeSelector(context),
            
            const SizedBox(height: 24),
            
            // Localisation GPS
            _buildLocationSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildClientTypeSelector(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Type de client',
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _clientTypes.map((type) {
            final isSelected = _selectedClientType == type['value'];
            return GestureDetector(
              onTap: () {
                setState(() => _selectedClientType = type['value'] as String);
              },
              child: Container(
                width: (MediaQuery.of(context).size.width - 72) / 2,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColor.primarySoft
                      : AppColor.grey50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : AppColor.grey200,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      type['icon'] as IconData,
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : AppColor.grey600,
                      size: 24,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      type['label'] as String,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary
                                : AppColor.grey800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      type['description'] as String,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary.withOpacity(0.8)
                                : AppColor.grey600,
                          ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildLocationSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColor.primarySoft,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColor.primary.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.gps_fixed_rounded,
                color: Theme.of(context).colorScheme.primary,
                size: 20,
              ),
              const SizedBox(width: 10),
              Text(
                'Localisation GPS',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Text(
            'Pour des livraisons plus rapides et précises, nous vous recommandons de capturer votre position GPS.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                  height: 1.5,
                ),
          ),
          
          const SizedBox(height: 16),
          
          if (_latitude != null && _longitude != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColor.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColor.success.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    color: AppColor.success,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Position capturée avec succès',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColor.success,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Lat: ${_latitude!.toStringAsFixed(6)} | Long: ${_longitude!.toStringAsFixed(6)}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColor.success.withOpacity(0.8),
                              ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.refresh_rounded,
                      color: AppColor.success,
                      size: 20,
                    ),
                    onPressed: _getCurrentLocation,
                  ),
                ],
              ),
            )
          else
            AuthButton(
              text: _isGettingLocation ? 'Localisation en cours...' : 'Capturer ma position',
              onPressed: _isGettingLocation ? () {} : _getCurrentLocation,
              fullWidth: true,
              backgroundColor: Colors.transparent,
              foregroundColor: Theme.of(context).colorScheme.primary,
              elevation: 0,
              icon: _isGettingLocation ? null : Icons.location_searching_rounded,
            ),
        ],
      ),
    );
  }

  Widget _buildLoginLink(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Déjà un compte ? ',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white.withOpacity(0.8),
              ),
        ),
        TextButton(
          onPressed: () => context.go(AppRouter.login),
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
            minimumSize: Size.zero,
          ),
          child: Text(
            'Se connecter',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  decoration: TextDecoration.underline,
                ),
          ),
        ),
      ],
    );
  }

  Widget _buildTermsSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            Icons.shield_rounded,
            color: Colors.white.withOpacity(0.8),
            size: 20,
          ),
          const SizedBox(height: 8),
          Text(
            'En vous inscrivant, vous acceptez nos',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withOpacity(0.8),
                ),
            textAlign: TextAlign.center,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(
                onPressed: () {
                  // TODO: Ouvrir les conditions d'utilisation
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                ),
                child: Text(
                  'conditions d\'utilisation',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                ),
              ),
              Text(
                ' et notre ',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Ouvrir la politique de confidentialité
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                ),
                child: Text(
                  'politique de confidentialité',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isGettingLocation = true);

    try {
      // Vérifier les permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showLocationErrorSnackBar(
            context,
            'La permission de localisation est requise',
          );
          setState(() => _isGettingLocation = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _showLocationErrorSnackBar(
          context,
          'La localisation est désactivée. Activez-la dans les paramètres.',
        );
        setState(() => _isGettingLocation = false);
        return;
      }

      // Obtenir la position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _isGettingLocation = false;
      });

      _showSuccessSnackBar(
        context,
        'Position GPS capturée avec succès',
      );
    } catch (e) {
      setState(() => _isGettingLocation = false);
      _showLocationErrorSnackBar(
        context,
        'Erreur lors de la localisation: ${e.toString()}',
      );
    }
  }

  void _submitRegistration() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedClientType == null) {
        _showErrorSnackBar(
          context,
          'Veuillez sélectionner un type de client',
        );
        return;
      }

      FocusScope.of(context).unfocus();
      context.read<AuthBloc>().add(
            RegisterRequested(
              nomPointVente: _pointDeVenteController.text,
              nomResponsable: _responsableController.text,
              telephone: _telephoneController.text,
              email: _emailController.text,
              motDePasse: _passwordController.text,
              adresse: _adresseController.text,
              latitude: _latitude,
              longitude: _longitude,
              typeClient: _selectedClientType!,
            ),
          );
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

  void _showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColor.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showLocationErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.location_off_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColor.warning,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}