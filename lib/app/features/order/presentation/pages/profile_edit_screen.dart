import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

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
      // TODO: Implement update profile
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Fonction en cours de développement'),
          backgroundColor: AppColor.info,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Modifier mon profil'),
        backgroundColor: AppColor.primary,
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is! AuthAuthenticated) {
            return const Center(
              child: Text('Non authentifié'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  // Avatar
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 60,
                          backgroundColor: AppColor.primaryLight,
                          child: state.user.photoUrl != null
                              ? ClipOval(
                                  child: Image.network(
                                    state.user.photoUrl!,
                                    width: 120,
                                    height: 120,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.person,
                                      size: 60,
                                      color: AppColor.white,
                                    ),
                                  ),
                                )
                              : const Icon(
                                  Icons.person,
                                  size: 60,
                                  color: AppColor.white,
                                ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: CircleAvatar(
                            radius: 20,
                            backgroundColor: AppColor.primary,
                            child: IconButton(
                              icon: const Icon(
                                Icons.camera_alt,
                                size: 20,
                                color: AppColor.white,
                              ),
                              onPressed: () {
                                // TODO: Implement photo upload
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Upload photo en cours de développement'),
                                    backgroundColor: AppColor.info,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Email (read-only)
                  CustomTextField(
                    controller: TextEditingController(text: state.user.email),
                    label: 'Email',
                    icon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) => null,
                  ),

                  const SizedBox(height: 16),

                  // Nom point de vente
                  CustomTextField(
                    controller: _nomPointVenteController,
                    label: 'Nom du point de vente',
                    icon: Icons.store_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Nom du point de vente requis';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 16),

                  // Nom responsable
                  CustomTextField(
                    controller: _nomResponsableController,
                    label: 'Nom du responsable',
                    icon: Icons.person_outline,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Nom du responsable requis';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 16),

                  // Téléphone
                  CustomTextField(
                    controller: _telephoneController,
                    label: 'Téléphone',
                    icon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Téléphone requis';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 16),

                  // Adresse
                  CustomTextField(
                    controller: _adresseController,
                    label: 'Adresse',
                    icon: Icons.location_on_outlined,
                    maxLines: 2,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Adresse requise';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 32),

                  // Save button
                  PrimaryButton(
                    text: 'Enregistrer les modifications',
                    onPressed: _handleSave,
                    icon: Icons.save,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}