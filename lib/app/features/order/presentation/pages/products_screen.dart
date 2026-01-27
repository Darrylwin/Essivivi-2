import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
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
    // Load products on init
    context.read<OrderBloc>().add(const LoadProductsRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Commander'),
        backgroundColor: AppColor.primary,
        actions: [
          // Cart icon with badge
          BlocBuilder<OrderBloc, OrderState>(
            builder: (context, state) {
              int cartCount = 0;
              if (state is ProductsLoaded) {
                cartCount = state.cartItemsCount;
              }

              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart_outlined),
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
                  if (cartCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColor.error,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          cartCount > 99 ? '99+' : '$cartCount',
                          style: const TextStyle(
                            color: AppColor.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
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
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is OrderLoading) {
            return const Center(
              child: CircularProgressIndicator(),
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
                  const Icon(
                    Icons.error_outline,
                    size: 80,
                    color: AppColor.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    state.message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () {
                      context.read<OrderBloc>().add(const LoadProductsRequested());
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Réessayer'),
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
      return const Center(
        child: Text('Aucun produit disponible'),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        context.read<OrderBloc>().add(const LoadProductsRequested());
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: state.products.length,
        itemBuilder: (context, index) {
          final product = state.products[index];
          return _buildProductCard(product, state);
        },
      ),
    );
  }

  Widget _buildProductCard(Product product, ProductsLoaded state) {
    final isInCart = state.isInCart(product.id);
    final quantity = state.getQuantity(product.id);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Product Image
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColor.primarySoft,
                borderRadius: BorderRadius.circular(12),
              ),
              child: product.photo != null
                  ? ClipRRectangle(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        product.photo!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.water_drop,
                          size: 40,
                          color: AppColor.primary,
                        ),
                      ),
                    )
                  : const Icon(
                      Icons.water_drop,
                      size: 40,
                      color: AppColor.primary,
                    ),
            ),

            const SizedBox(width: 16),

            // Product Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Brand
                  Text(
                    product.marque,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColor.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  const SizedBox(height: 4),

                  // Name + Volume
                  Text(
                    product.displayName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColor.textPrimary,
                    ),
                  ),

                  const SizedBox(height: 4),

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
                        fontSize: 11,
                        color: AppColor.secondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Price
                  Text(
                    '${product.prixUnitaire.toStringAsFixed(0)} FCFA',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColor.primary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 12),

            // Add to cart button
            if (!isInCart)
              IconButton(
                onPressed: () {
                  context.read<OrderBloc>().add(
                        AddToCartRequested(produitId: product.id),
                      );
                },
                icon: const Icon(Icons.add_shopping_cart),
                style: IconButton.styleFrom(
                  backgroundColor: AppColor.primary,
                  foregroundColor: AppColor.white,
                ),
              )
            else
              // Quantity controls
              Container(
                decoration: BoxDecoration(
                  color: AppColor.primarySoft,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    IconButton(
                      onPressed: () {
                        context.read<OrderBloc>().add(
                              UpdateCartQuantityRequested(
                                produitId: product.id,
                                quantite: quantity + 1,
                              ),
                            );
                      },
                      icon: const Icon(Icons.add, size: 20),
                      padding: const EdgeInsets.all(4),
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                    ),
                    Text(
                      '$quantity',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColor.primary,
                      ),
                    ),
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
                        quantity > 1 ? Icons.remove : Icons.delete_outline,
                        size: 20,
                      ),
                      padding: const EdgeInsets.all(4),
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
      ),
    );
  }
}

// Helper widget for ClipRRect
class ClipRRectangle extends StatelessWidget {
  final BorderRadius borderRadius;
  final Widget child;

  const ClipRRectangle({
    super.key,
    required this.borderRadius,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius,
      child: child,
    );
  }
}