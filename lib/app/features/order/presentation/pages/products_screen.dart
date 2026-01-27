import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';
import '../../domain/entities/product.dart';
import 'cart_screen.dart';

/// Products Screen - Liste des produits avec panier
class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<OrderBloc>().add(const LoadProductsRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Commander'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColor.textPrimary,
        actions: [
          // Cart icon with badge
          BlocBuilder<OrderBloc, OrderState>(
            builder: (context, state) {
              int cartCount = 0;
              if (state is ProductsLoaded) {
                cartCount = state.cartItemsCount;
              }

              return Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    margin: const EdgeInsets.only(right: 8),
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
                      icon: Icon(
                        cartCount > 0
                            ? Icons.shopping_bag_rounded
                            : Icons.shopping_bag_outlined,
                        color: cartCount > 0
                            ? AppColor.primary
                            : AppColor.textPrimary,
                        size: 22,
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => BlocProvider.value(
                              value: context.read<OrderBloc>(),
                              child: const CartScreen(),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  if (cartCount > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: const BoxDecoration(
                          color: AppColor.error,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            cartCount > 9 ? '9+' : '$cartCount',
                            style: const TextStyle(
                              color: AppColor.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: BlocConsumer<OrderBloc, OrderState>(
        listener: (context, state) {
          if (state is OrderError) {
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
          if (state is OrderLoading) {
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
                    'Chargement des produits...',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColor.textPrimary,
                    ),
                  ),
                ],
              ),
            );
          }

          if (state is ProductsLoaded) {
            return _buildProductsList(state);
          }

          if (state is OrderError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColor.error.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.error_outline_rounded,
                      size: 40,
                      color: AppColor.error,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Erreur de chargement',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColor.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      state.message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColor.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  PrimaryButton(
                    text: 'Réessayer',
                    onPressed: () {
                      context.read<OrderBloc>().add(const LoadProductsRequested());
                    },
                    icon: Icons.refresh_rounded,
                    width: 180,
                  ),
                ],
              ),
            );
          }

          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildProductsList(ProductsLoaded state) {
    if (state.products.isEmpty) {
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
                Icons.water_drop_outlined,
                size: 60,
                color: AppColor.primary,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Aucun produit disponible',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColor.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Revenez plus tard',
              style: TextStyle(
                fontSize: 14,
                color: AppColor.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Products count
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColor.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${state.products.length} produit${state.products.length > 1 ? 's' : ''}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColor.primary,
                  ),
                ),
              ),
              if (state.cartItemsCount > 0) ...[
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColor.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${state.cartItemsCount} dans le panier',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColor.successDark,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),

        // Products grid
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async {
              context.read<OrderBloc>().add(const LoadProductsRequested());
            },
            child: GridView.builder(
              padding: const EdgeInsets.all(20),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                childAspectRatio: 0.8,
              ),
              itemCount: state.products.length,
              itemBuilder: (context, index) {
                final product = state.products[index];
                return _buildProductCard(product, state);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProductCard(Product product, ProductsLoaded state) {
    final isInCart = state.isInCart(product.id);
    final quantity = state.getQuantity(product.id);

    return Container(
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
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Stack(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Image
                    Center(
                      child: Container(
                        width: 80,
                        height: 80,
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
                          boxShadow: [
                            BoxShadow(
                              color: AppColor.primary.withOpacity(0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: product.photo != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.network(
                                  product.photo!,
                                  fit: BoxFit.cover,
                                  width: 80,
                                  height: 80,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(
                                      Icons.water_drop_rounded,
                                      size: 40,
                                      color: AppColor.white,
                                    ),
                                  ),
                                ),
                              )
                            : const Center(
                                child: Icon(
                                  Icons.water_drop_rounded,
                                  size: 40,
                                  color: AppColor.white,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Brand
                    Text(
                      product.marque,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColor.textSecondary,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),

                    const SizedBox(height: 4),

                    // Name
                    Text(
                      product.displayName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColor.textPrimary,
                        height: 1.3,
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Category
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColor.secondary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        product.categorieNom,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColor.secondary,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),

                    const Spacer(),

                    // Price and Add to cart
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${product.prixUnitaire.toStringAsFixed(0)} FCFA',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColor.primary,
                          ),
                        ),
                        if (!isInCart)
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: AppColor.primary,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColor.primary.withOpacity(0.4),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: IconButton(
                              onPressed: () {
                                context.read<OrderBloc>().add(
                                      AddToCartRequested(produitId: product.id),
                                    );
                              },
                              icon: const Icon(
                                Icons.add_rounded,
                                color: AppColor.white,
                                size: 18,
                              ),
                              padding: EdgeInsets.zero,
                            ),
                          )
                        else
                          Container(
                            decoration: BoxDecoration(
                              color: AppColor.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
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
                                    } else {
                                      context.read<OrderBloc>().add(
                                            RemoveFromCartRequested(product.id),
                                          );
                                    }
                                  },
                                  icon: Icon(
                                    quantity > 1
                                        ? Icons.remove_rounded
                                        : Icons.delete_outline_rounded,
                                    size: 18,
                                    color: AppColor.primary,
                                  ),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(
                                    minWidth: 32,
                                    minHeight: 32,
                                  ),
                                ),
                                Text(
                                  '$quantity',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColor.primary,
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
                                  icon: const Icon(
                                    Icons.add_rounded,
                                    size: 18,
                                    color: AppColor.primary,
                                  ),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(
                                    minWidth: 32,
                                    minHeight: 32,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),

                // Product availability badge
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColor.success.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Disponible',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColor.successDark,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}