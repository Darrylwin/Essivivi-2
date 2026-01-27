import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/di/service_locator.dart' as di;
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../order/presentation/bloc/order_bloc.dart';
import '../../../order/presentation/pages/products_screen.dart';
import '../../../order/presentation/pages/my_orders_screen.dart';
import 'profile_edit_screen.dart';
import 'change_password_screen.dart';

/// Client Home Screen avec bottom navigation
class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const ProductsScreen(),
      const MyOrdersScreen(),
      const ProfileTab(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => di.sl<OrderBloc>(),
      child: Scaffold(
        body: _screens[_currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          selectedItemColor: AppColor.primary,
          unselectedItemColor: AppColor.grey500,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_outlined),
              activeIcon: Icon(Icons.shopping_bag),
              label: 'Commander',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.list_alt_outlined),
              activeIcon: Icon(Icons.list_alt),
              label: 'Mes commandes',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }
}

/// Profile Tab
class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Profil'),
        backgroundColor: AppColor.primary,
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is! AuthAuthenticated) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          final user = state.user;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Profile Header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      // Avatar
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: AppColor.primaryLight,
                        child: user.photoUrl != null
                            ? ClipOval(
                                child: Image.network(
                                  user.photoUrl!,
                                  width: 100,
                                  height: 100,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(
                                    Icons.person,
                                    size: 50,
                                    color: AppColor.white,
                                  ),
                                ),
                              )
                            : const Icon(
                                Icons.person,
                                size: 50,
                                color: AppColor.white,
                              ),
                      ),

                      const SizedBox(height: 16),

                      // Name
                      Text(
                        user.nomPointVente ?? 'Point de vente',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 4),

                      // Code
                      Text(
                        user.codeClient ?? '',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColor.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Email
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.email_outlined,
                            size: 16,
                            color: AppColor.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            user.email,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColor.textSecondary,
                            ),
                          ),
                        ],
                      ),

                      if (user.telephone != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.phone_outlined,
                              size: 16,
                              color: AppColor.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              user.telephone!,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColor.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Menu items
              _buildMenuItem(
                context,
                icon: Icons.person_outline,
                title: 'Modifier mon profil',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BlocProvider.value(
                        value: context.read<AuthBloc>(),
                        child: const ProfileEditScreen(),
                      ),
                    ),
                  );
                },
              ),

              _buildMenuItem(
                context,
                icon: Icons.lock_outline,
                title: 'Changer le mot de passe',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BlocProvider.value(
                        value: context.read<AuthBloc>(),
                        child: const ChangePasswordScreen(),
                      ),
                    ),
                  );
                },
              ),

              _buildMenuItem(
                context,
                icon: Icons.location_on_outlined,
                title: 'Mon adresse',
                subtitle: user.adresse ?? 'Non renseignée',
                onTap: () {
                  // TODO: Navigate to address edit
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Fonction en cours de développement'),
                      backgroundColor: AppColor.info,
                    ),
                  );
                },
              ),

              _buildMenuItem(
                context,
                icon: Icons.help_outline,
                title: 'Aide & Support',
                onTap: () {
                  // TODO: Navigate to help
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Contactez-nous: support@essivivi.tg'),
                      backgroundColor: AppColor.info,
                    ),
                  );
                },
              ),

              _buildMenuItem(
                context,
                icon: Icons.info_outline,
                title: 'À propos',
                onTap: () {
                  showAboutDialog(
                    context: context,
                    applicationName: 'ESSIVIVI',
                    applicationVersion: '1.0.0',
                    applicationIcon: Container(
                      width: 60,
                      height: 60,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AppColor.primaryGradient,
                      ),
                      child: const Icon(
                        Icons.water_drop,
                        size: 30,
                        color: AppColor.white,
                      ),
                    ),
                    children: [
                      const Text(
                        'Livraison d\'eau à domicile',
                        style: TextStyle(fontSize: 14),
                      ),
                    ],
                  );
                },
              ),

              const SizedBox(height: 24),

              // Logout button
              ElevatedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Déconnexion'),
                      content: const Text('Voulez-vous vraiment vous déconnecter ?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Annuler'),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            context.read<AuthBloc>().add(const LogoutRequested());
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColor.error,
                          ),
                          child: const Text('Se déconnecter'),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.logout),
                label: const Text('Se déconnecter'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColor.error,
                  foregroundColor: AppColor.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppColor.primary),
        title: Text(title),
        subtitle: subtitle != null ? Text(subtitle) : null,
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}