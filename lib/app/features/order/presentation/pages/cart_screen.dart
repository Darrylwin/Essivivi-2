import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../domain/repositories/order_repository.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';
import '../../domain/entities/order.dart'; // Import correct pour OrderLineItem
import '../../domain/entities/product.dart'; // Import pour Product

/// Cart Screen - Panier avec résumé et checkout
class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _useClientAddress = true;
  final _addressController = TextEditingController();

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  void _handleCheckout(ProductsLoaded state) {
    if (state.cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Votre panier est vide'),
          backgroundColor: AppColor.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      return;
    }

    final lignes = state.cart.entries
        .map((entry) => OrderLineItem(
              produitId: entry.key,
              quantite: entry.value,
            ))
        .toList();

    context.read<OrderBloc>().add(
          CreateOrderRequested(
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
      appBar: AppBar(
        title: const Text('Mon Panier'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColor.textPrimary,
      ),
      body: BlocConsumer<OrderBloc, OrderState>(
        listener: (context, state) {
          if (state is OrderCreated) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
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
          if (state is OrderCreating) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
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
                    'Création de la commande...',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
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

          if (state is ProductsLoaded) {
            if (state.cart.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: AppColor.primary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.shopping_cart_outlined,
                        size: 60,
                        color: AppColor.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Votre panier est vide',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColor.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Ajoutez des produits pour continuer',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColor.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 32),
                    SecondaryButton(
                      text: 'Continuer mes achats',
                      onPressed: () => Navigator.pop(context),
                      icon: Icons.arrow_back_rounded,
                      width: 200,
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: [
                // Cart items list
                Expanded(
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColor.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.shopping_bag_outlined,
                                      size: 16,
                                      color: AppColor.primary,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${state.cartItemsCount} article${state.cartItemsCount > 1 ? 's' : ''}',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppColor.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColor.success.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '${state.cartTotalAmount.toStringAsFixed(0)} FCFA',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: AppColor.successDark,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        sliver: SliverList.builder(
                          itemCount: state.cart.length,
                          itemBuilder: (context, index) {
                            final entry = state.cart.entries.elementAt(index);
                            final product = state.products
                                .firstWhere(
                                  (p) => p.id == entry.key,
                                  orElse: () => Product(
                                    id: entry.key,
                                    nom: 'Produit non trouvé',
                                    marque: '',
                                    prixUnitaire: 0,
                                    volume: '',
                                    photo: null,
                                    categorieId: 0,
                                    categorieNom: '',
                                    uniteVente: '',
                                    actif: false,
                                    createdAt: DateTime.now(),
                                  ),
                                );
                            return _buildCartItem(product, entry.value);
                          },
                        ),
                      ),
                      const SliverToBoxAdapter(
                        child: SizedBox(height: 100),
                      ),
                    ],
                  ),
                ),

                // Summary and checkout
                Container(
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
                      // Address option
                      Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColor.primary.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.location_on_rounded,
                              color: AppColor.primary,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Adresse de livraison',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppColor.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _useClientAddress
                                      ? 'Utiliser mon adresse enregistrée'
                                      : 'Adresse spécifique',
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
                        const SizedBox(height: 16),
                        CustomTextField(
                          controller: _addressController,
                          label: 'Adresse de livraison',
                          hint: 'Entrez l\'adresse complète',
                          icon: Icons.location_on_outlined,
                          maxLines: 2,
                          backgroundColor: AppColor.background,
                        ),
                      ],

                      const SizedBox(height: 24),

                      // Divider
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

                      const SizedBox(height: 24),

                      // Summary
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Articles',
                            style: TextStyle(
                              fontSize: 15,
                              color: AppColor.textSecondary,
                            ),
                          ),
                          Text(
                            '${state.cartItemsCount}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            '${state.cartTotalAmount.toStringAsFixed(0)} FCFA',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppColor.primary,
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
                ),
              ],
            );
          }

          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildCartItem(Product product, int quantity) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColor.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product image
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColor.primarySoft,
                borderRadius: BorderRadius.circular(12),
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColor.primaryLight,
                    AppColor.secondaryLight,
                  ],
                ),
              ),
              child: Center(
                child: product.photo != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          product.photo!,
                          fit: BoxFit.cover,
                          width: 80,
                          height: 80,
                        ),
                      )
                    : const Icon(
                        Icons.water_drop_rounded,
                        size: 40,
                        color: AppColor.white,
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
                      fontWeight: FontWeight.w700,
                      color: AppColor.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.marque,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColor.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${product.prixUnitaire.toStringAsFixed(0)} FCFA',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColor.primary,
                    ),
                  ),
                ],
              ),
            ),

            Column(
              children: [
                // Delete button
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
                const SizedBox(height: 16),

                // Quantity controls
                Container(
                  decoration: BoxDecoration(
                    color: AppColor.background,
                    borderRadius: BorderRadius.circular(12),
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
                        icon: const Icon(Icons.remove_rounded, size: 20),
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
                          color: AppColor.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$quantity',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
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
                        icon: const Icon(Icons.add_rounded, size: 20),
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
}