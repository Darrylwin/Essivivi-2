import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';

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

  final List<String> _clientTypes = [
    'detaillant',
    'grossiste',
    'institution',
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
          context.pushReplacement(
            '/otp-verification',
            extra: state.email,
          );
        } else if (state is AuthError) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Inscription Client'),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),

                // Title
                const Text(
                  'Créer votre compte client',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 10),

                const Text(
                  'Remplissez le formulaire pour créer votre compte',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 40),

                // Point de vente
                AuthTextField(
                  controller: _pointDeVenteController,
                  labelText: 'Nom du point de vente',
                  hintText: 'Ex: Boulangerie du Marché',
                  prefixIcon: Icons.store,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez entrer le nom du point de vente';
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
                  prefixIcon: Icons.person,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez entrer le nom du responsable';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 20),

                // Téléphone
                AuthTextField(
                  controller: _telephoneController,
                  labelText: 'Numéro de téléphone',
                  hintText: 'Ex: +228 90 12 34 56',
                  prefixIcon: Icons.phone,
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez entrer votre numéro de téléphone';
                    }
                    // Validation simple du numéro
                    final phoneRegex = RegExp(r'^[0-9+\-\s]{8,}$');
                    if (!phoneRegex.hasMatch(value.replaceAll(' ', ''))) {
                      return 'Numéro de téléphone invalide';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 20),

                // Email
                AuthTextField(
                  controller: _emailController,
                  labelText: 'Email',
                  hintText: 'Ex: contact@example.com',
                  prefixIcon: Icons.email,
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

                // Password
                AuthTextField(
                  controller: _passwordController,
                  labelText: 'Mot de passe',
                  hintText: 'Minimum 6 caractères',
                  prefixIcon: Icons.lock,
                  obscureText: true,
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

                // Confirm Password
                AuthTextField(
                  controller: _confirmPasswordController,
                  labelText: 'Confirmer le mot de passe',
                  hintText: 'Ressaisissez votre mot de passe',
                  prefixIcon: Icons.lock_outline,
                  obscureText: true,
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
                  prefixIcon: Icons.location_on,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez entrer votre adresse';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 20),

                // Type de client
                DropdownButtonFormField<String>(
                  value: _selectedClientType,
                  decoration: InputDecoration(
                    labelText: 'Type de client',
                    hintText: 'Sélectionnez votre type',
                    prefixIcon: const Icon(Icons.category),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  items: _clientTypes.map((type) {
                    String displayName = type;
                    if (type == 'detaillant') displayName = 'Détaillant';
                    if (type == 'grossiste') displayName = 'Grossiste';
                    if (type == 'institution') displayName = 'Institution';

                    return DropdownMenuItem(
                      value: type,
                      child: Text(displayName),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedClientType = value;
                    });
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez sélectionner un type';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 20),

                // Localisation GPS
                Card(
                  elevation: 1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey[300]!),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.gps_fixed,
                              color: Colors.blue[700],
                            ),
                            const SizedBox(width: 10),
                            const Text(
                              'Localisation GPS',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Pour optimiser vos livraisons, nous vous recommandons de capturer votre position GPS.',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (_latitude != null && _longitude != null)
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.check_circle,
                                  color: Colors.green[700],
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Position capturée: ${_latitude!.toStringAsFixed(6)}, ${_longitude!.toStringAsFixed(6)}',
                                    style: TextStyle(
                                      color: Colors.green[700],
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          OutlinedButton.icon(
                            onPressed: _isGettingLocation ? null : _getCurrentLocation,
                            icon: _isGettingLocation
                                ? const SizedBox(
                                    height: 16,
                                    width: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Icon(Icons.location_searching),
                            label: Text(
                              _isGettingLocation
                                  ? 'Localisation en cours...'
                                  : 'Capturer ma position',
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue[700],
                              side: BorderSide(color: Colors.blue[700]!),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 40),

                // Register button
                AuthButton(
                  text: 'S\'inscrire',
                  onPressed: _submitRegistration,
                  isLoading: _isLoading,
                ),

                const SizedBox(height: 20),

                // Login link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Déjà un compte? '),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      child: const Text(
                        'Se connecter',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 40),

                // Terms and conditions
                Text(
                  'En vous inscrivant, vous acceptez nos conditions d\'utilisation et notre politique de confidentialité.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
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
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('La permission de localisation est requise'),
              backgroundColor: Colors.orange,
            ),
          );
          setState(() => _isGettingLocation = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'La localisation est désactivée. Activez-la dans les paramètres.',
            ),
            backgroundColor: Colors.orange,
          ),
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

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Position GPS capturée avec succès'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() => _isGettingLocation = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la localisation: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _submitRegistration() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedClientType == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Veuillez sélectionner un type de client'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

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
}