import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_state.dart';

/// Profile Edit Screen - Modifier les informations du profil
class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomPointVenteController = TextEditingController();
  final _nomResponsableController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _adresseController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    final state = context.read<AuthBloc>().state;
    if (state is AuthAuthenticated) {
      final user = state.user;
      _nomPointVenteController.text = user.nomPointVente ?? '';
      _nomResponsableController.text = user.nomResponsable ?? '';
      _telephoneController.text = user.telephone ?? '';
      _adresseController.text = user.adresse ?? '';
    }
  }

  @override
  void dispose() {
    _nomPointVenteController.dispose();
    _nomResponsableController.dispose();
    _telephoneController.dispose();
    _adresseController.dispose();
    super.dispose();
  }

  void _handleSave() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Fonction en cours de développement'),
          backgroundColor: AppColor.info,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
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
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is! AuthAuthenticated) {
            return const Center(
              child: Text(
                'Non authentifié',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColor.textSecondary,
                ),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Avatar
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AppColor.primary,
                            AppColor.secondary,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColor.primary.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: state.user.photoUrl != null
                          ? ClipOval(
                              child: Image.network(
                                state.user.photoUrl!,
                                width: 120,
                                height: 120,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.person_rounded,
                                  size: 60,
                                  color: AppColor.white,
                                ),
                              ),
                            )
                          : const Icon(
                              Icons.person_rounded,
                              size: 60,
                              color: AppColor.white,
                            ),
                    ),
                    Container(
                      width: 36,
                      height: 36,
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
                        icon: const Icon(
                          Icons.camera_alt_rounded,
                          size: 18,
                          color: AppColor.primary,
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content:
                                  const Text('Upload photo en cours de développement'),
                              backgroundColor: AppColor.info,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          );
                        },
                        padding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 40),

                // Title
                const Text(
                  'Modifier mon profil',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: AppColor.textPrimary,
                    letterSpacing: 0.5,
                  ),
                ),

                const SizedBox(height: 8),

                const Text(
                  'Mettez à jour vos informations personnelles',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: AppColor.textSecondary,
                  ),
                ),

                const SizedBox(height: 40),

                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // Email (read-only)
                      CustomTextField(
                        controller: TextEditingController(text: state.user.email),
                        label: 'Email',
                        hint: 'votre@email.com',
                        icon: Icons.email_rounded,
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) => null,
                        enabled: false,
                        backgroundColor: AppColor.background,
                      ),

                      const SizedBox(height: 20),

                      // Nom point de vente
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

                      const SizedBox(height: 20),

                      // Nom responsable
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

                      const SizedBox(height: 20),

                      // Téléphone
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
                          return null;
                        },
                      ),

                      const SizedBox(height: 20),

                      // Adresse
                      CustomTextField(
                        controller: _adresseController,
                        label: 'Adresse',
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

                      const SizedBox(height: 40),

                      // Info box
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColor.primary.withOpacity(0.05),
                              AppColor.primary.withOpacity(0.02),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: AppColor.primary.withOpacity(0.1),
                            width: 1,
                          ),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.info_outline_rounded,
                              color: AppColor.primary,
                              size: 20,
                            ),
                            SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Information',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColor.primary,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Ces informations seront utilisées pour vos livraisons et facturations.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColor.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 40),

                      // Save button
                      PrimaryButton(
                        text: 'Enregistrer les modifications',
                        onPressed: _handleSave,
                        icon: Icons.check_circle_outline_rounded,
                      ),
                    ],
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