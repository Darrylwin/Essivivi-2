import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/services/location_service.dart';
import '../../domain/repositories/order_repository.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';

/// Cart Screen amélioré avec géolocalisation
class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _useClientAddress = true;
  bool _isLoadingLocation = false;
  Position? _currentPosition;
  final _addressController = TextEditingController();
  final _locationService = LocationService();

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      final position = await _locationService.getCurrentLocation();
      setState(() {
        _currentPosition = position;
        _isLoadingLocation = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: AppColor.white),
                SizedBox(width: 12),
                Text('Position obtenue avec succès'),
              ],
            ),
            backgroundColor: AppColor.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isLoadingLocation = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: AppColor.white),
                const SizedBox(width: 12),
                Expanded(child: Text(e.toString())),
              ],
            ),
            backgroundColor: AppColor.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            duration: const Duration(seconds: 4),
            action: SnackBarAction(
              label: 'Paramètres',
              textColor: AppColor.white,
              onPressed: () {
                _locationService.openAppSettings();
              },
            ),
          ),
        );
      }
    }
  }

  void _handleCheckout(ProductsLoaded state) {
    if (state.cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.warning, color: AppColor.white),
              SizedBox(width: 12),
              Text('Votre panier est vide'),
            ],
          ),
          backgroundColor: AppColor.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      return;
    }

    // Validate location
    if (!_useClientAddress) {
      if (_currentPosition == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.location_off, color: AppColor.white),
                SizedBox(width: 12),
                Expanded(
                  child: Text('Veuillez obtenir votre position GPS'),
                ),
              ],
            ),
            backgroundColor: AppColor.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            action: SnackBarAction(
              label: 'Obtenir',
              textColor: AppColor.white,
              onPressed: _getCurrentLocation,
            ),
          ),
        );
        return;
      }
    }

    final lignes = state.cart.entries
        .map((entry) => OrderLineItem(
              produitId: entry.key,
              quantite: entry.value,
            ))
        .toList();

    context.read<OrderBloc>().add(
          CreateOrderRequested(
            latitudeLivraison: _useClientAddress ? null : _currentPosition?.latitude,
            longitudeLivraison: _useClientAddress ? null : _currentPosition?.longitude,
            utiliserCoordonneesClient: _useClientAddress,
            adresseTextuelle: _addressController.text.trim().isNotEmpty
                ? _addressController.text.trim()
                : null,
            lignes: lignes,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor.background,
      appBar: AppBar(
        title: const Text('Mon Panier'),
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
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      body: BlocConsumer<OrderBloc, OrderState>(
        listener: (context, state) {
          if (state is OrderCreated) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle, color: AppColor.white),
                    const SizedBox(width: 12),
                    Expanded(child: Text(state.message)),
                  ],
                ),
                backgroundColor: AppColor.success,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
            Navigator.pop(context);
            context.read<OrderBloc>().add(const LoadProductsRequested());
          } else if (state is OrderError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColor.white),
                    const SizedBox(width: 12),
                    Expanded(child: Text(state.message)),
                  ],
                ),
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
          if (state is OrderCreating) {
            return _buildCreatingState();
          }

          if (state is ProductsLoaded) {
            if (state.cart.isEmpty) {
              return _buildEmptyCart();
            }
            return _buildCartContent(state);
          }

          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildCreatingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const AppLogo(size: 100, animate: true),
          const SizedBox(height: 32),
          SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(
              strokeWidth: 4,
              color: AppColor.primary,
              backgroundColor: AppColor.primary.withOpacity(0.1),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Création de votre commande...',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColor.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Patientez un instant',
            style: TextStyle(
              fontSize: 14,
              color: AppColor.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColor.primary.withOpacity(0.15),
                    AppColor.secondary.withOpacity(0.15),
                  ],
                ),
              ),
              child: const Icon(
                Icons.shopping_cart_outlined,
                size: 70,
                color: AppColor.primary,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Panier vide',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: AppColor.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Ajoutez des produits pour\ncommencer votre commande',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: AppColor.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            SecondaryButton(
              text: 'Voir les produits',
              onPressed: () => Navigator.pop(context),
              icon: Icons.arrow_back_rounded,
              width: 220,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartContent(ProductsLoaded state) {
    return Column(
      children: [
        // Cart items list
        Expanded(
          child: CustomScrollView(
            slivers: [
              // Header stats
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppColor.primary,
                        AppColor.primaryLight,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColor.primary.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildCartStat(
                          icon: Icons.shopping_bag_rounded,
                          label: 'Articles',
                          value: '${state.cartItemsCount}',
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 40,
                        color: AppColor.white.withOpacity(0.3),
                      ),
                      Expanded(
                        child: _buildCartStat(
                          icon: Icons.payments_rounded,
                          label: 'Total',
                          value: '${state.cartTotalAmount.toStringAsFixed(0)} F',
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Cart items
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList.builder(
                  itemCount: state.cart.length,
                  itemBuilder: (context, index) {
                    final entry = state.cart.entries.elementAt(index);
                    final product = state.products.firstWhere(
                      (p) => p.id == entry.key,
                    );
                    return _buildCartItem(product, entry.value);
                  },
                ),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 20),
              ),

              // Location section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '📍 Adresse de livraison',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColor.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildLocationSection(),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 120),
              ),
            ],
          ),
        ),

        // Checkout section
        _buildCheckoutSection(state),
      ],
    );
  }

  Widget _buildCartStat({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Icon(icon, color: AppColor.white, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: AppColor.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColor.white.withOpacity(0.9),
          ),
        ),
      ],
    );
  }

  Widget _buildCartItem(dynamic product, int quantity) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColor.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Product image
            Hero(
              tag: 'product-${product.id}',
              child: Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColor.primaryLight,
                      AppColor.secondaryLight,
                    ],
                  ),
                ),
                child: product.photo != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.network(
                          product.photo!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(
                              Icons.water_drop_rounded,
                              size: 35,
                              color: AppColor.white,
                            ),
                          ),
                        ),
                      )
                    : const Center(
                        child: Icon(
                          Icons.water_drop_rounded,
                          size: 35,
                          color: AppColor.white,
                        ),
                      ),
              ),
            ),

            const SizedBox(width: 16),

            // Product info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.nom,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColor.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${product.marque} • ${product.volume}',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColor.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        '${product.prixUnitaire.toStringAsFixed(0)} F',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColor.primary,
                        ),
                      ),
                      const Text(
                        ' × ',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColor.textSecondary,
                        ),
                      ),
                      Text(
                        '$quantity',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColor.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Quantity controls
            Column(
              children: [
                IconButton(
                  onPressed: () {
                    context.read<OrderBloc>().add(
                          RemoveFromCartRequested(product.id),
                        );
                  },
                  icon: const Icon(Icons.delete_outline_rounded),
                  color: AppColor.error,
                  iconSize: 22,
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: AppColor.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColor.primary.withOpacity(0.3),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        onPressed: () {
                          if (quantity > 1) {
                            context.read<OrderBloc>().add(
                                  UpdateCartQuantityRequested(
                                    produitId: product.id,
                                    quantite: quantity - 1,
                                  ),
                                );
                          }
                        },
                        icon: const Icon(Icons.remove_rounded, size: 18),
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(
                          minWidth: 36,
                          minHeight: 36,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColor.primary.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$quantity',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColor.primary,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          context.read<OrderBloc>().add(
                                UpdateCartQuantityRequested(
                                  produitId: product.id,
                                  quantite: quantity + 1,
                                ),
                              );
                        },
                        icon: const Icon(Icons.add_rounded, size: 18),
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(
                          minWidth: 36,
                          minHeight: 36,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationSection() {
    return Container(
      decoration: BoxDecoration(
        color: AppColor.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Address option toggle
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColor.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.location_on_rounded,
                    color: AppColor.primary,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Adresse de livraison',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColor.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _useClientAddress
                            ? 'Utiliser mon adresse enregistrée'
                            : 'Position GPS actuelle',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColor.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _useClientAddress,
                  onChanged: (value) {
                    setState(() {
                      _useClientAddress = value;
                    });
                  },
                  activeColor: AppColor.primary,
                ),
              ],
            ),

            if (!_useClientAddress) ...[
              const SizedBox(height: 20),
              Container(
                height: 1,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColor.border.withOpacity(0),
                      AppColor.border,
                      AppColor.border.withOpacity(0),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // GPS section
              if (_currentPosition == null)
                PrimaryButton(
                  text: 'Obtenir ma position',
                  onPressed: _isLoadingLocation ? () {} : _getCurrentLocation,
                  icon: _isLoadingLocation
                      ? null
                      : Icons.my_location_rounded,
                  isLoading: _isLoadingLocation,
                  backgroundColor: AppColor.success,
                )
              else
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColor.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColor.success.withOpacity(0.3),
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle_rounded,
                            color: AppColor.success,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Position GPS obtenue',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColor.successDark,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Lat: ${_currentPosition!.latitude.toStringAsFixed(6)}\n'
                                  'Long: ${_currentPosition!.longitude.toStringAsFixed(6)}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColor.textSecondary,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: _getCurrentLocation,
                            icon: const Icon(Icons.refresh_rounded),
                            color: AppColor.success,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      controller: _addressController,
                      label: 'Adresse (optionnel)',
                      hint: 'Ex: Maison blanche, près du marché',
                      icon: Icons.home_outlined,
                      maxLines: 2,
                      backgroundColor: AppColor.background,
                    ),
                  ],
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCheckoutSection(ProductsLoaded state) {
    return Container(
      decoration: BoxDecoration(
        color: AppColor.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 32,
            offset: const Offset(0, -8),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Summary
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total de la commande',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColor.textSecondary,
                ),
              ),
              Text(
                '${state.cartTotalAmount.toStringAsFixed(0)} FCFA',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: AppColor.primary,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Checkout button
          PrimaryButton(
            text: 'Valider la commande',
            onPressed: () => _handleCheckout(state),
            icon: Icons.check_circle_outline_rounded,
            height: 60,
          ),
        ],
      ),
    );
  }
}