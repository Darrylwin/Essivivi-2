import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';
import '../widgets/product_widgets.dart';
import 'cart_screen.dart';

/// Products Screen - Liste des produits avec panier amélioré
class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _fabController;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    context.read<OrderBloc>().add(const LoadProductsRequested());
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  List<String> _getCategories(ProductsLoaded state) {
    final categories = <String>{'all'};
    for (var product in state.products) {
      categories.add(product.categorieNom);
    }
    return categories.toList();
  }

  List<dynamic> _filterProducts(ProductsLoaded state) {
    if (_selectedCategory == 'all') {
      return state.products;
    }
    return state.products
        .where((p) => p.categorieNom == _selectedCategory)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor.background,
      body: BlocConsumer<OrderBloc, OrderState>(
        listener: (context, state) {
          if (state is OrderError) {
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
                margin: const EdgeInsets.all(16),
              ),
            );
          }

          // Animate FAB based on cart state
          if (state is ProductsLoaded) {
            if (state.cartItemsCount > 0) {
              _fabController.forward();
            } else {
              _fabController.reverse();
            }
          }
        },
        builder: (context, state) {
          if (state is OrderLoading) {
            return _buildLoadingState();
          }

          if (state is ProductsLoaded) {
            return _buildProductsList(state);
          }

          if (state is OrderError) {
            return _buildErrorState(state.message);
          }

          return const SizedBox();
        },
      ),

      // Floating Cart Button
      floatingActionButton: BlocBuilder<OrderBloc, OrderState>(
        builder: (context, state) {
          if (state is ProductsLoaded && state.cartItemsCount > 0) {
            return ScaleTransition(
              scale: CurvedAnimation(
                parent: _fabController,
                curve: Curves.elasticOut,
              ),
              child: _buildCartFAB(state),
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildLoadingState() {
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
            'Chargement des produits...',
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

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColor.error.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline_rounded,
                size: 50,
                color: AppColor.error,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Oups !',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: AppColor.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                color: AppColor.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'Réessayer',
              onPressed: () {
                context.read<OrderBloc>().add(const LoadProductsRequested());
              },
              icon: Icons.refresh_rounded,
              width: 200,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductsList(ProductsLoaded state) {
    if (state.products.isEmpty) {
      return EmptyProductsState(
        onRetry: () {
          context.read<OrderBloc>().add(const LoadProductsRequested());
        },
      );
    }

    final categories = _getCategories(state);
    final filteredProducts = _filterProducts(state);

    return CustomScrollView(
      slivers: [
        // App Bar
        SliverAppBar(
          expandedHeight: 140,
          floating: true,
          pinned: true,
          backgroundColor: AppColor.background,
          elevation: 0,
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColor.primary.withOpacity(0.1),
                    AppColor.background,
                  ],
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: const BoxDecoration(
                              gradient: AppColor.primaryGradient,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.water_drop_rounded,
                              color: AppColor.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ESSIVIVI',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                    color: AppColor.primary,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Eau fraîche livrée',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColor.textSecondary,
                                    fontWeight: FontWeight.w500,
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
              ),
            ),
            titlePadding: EdgeInsets.zero,
            expandedTitleScale: 1,
          ),
        ),

        // Stats banner
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.fromLTRB(20, 8, 20, 16),
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
                  child: _buildStatItem(
                    icon: Icons.water_drop_rounded,
                    label: 'Produits',
                    value: '${state.products.length}',
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: AppColor.white.withOpacity(0.3),
                ),
                Expanded(
                  child: _buildStatItem(
                    icon: Icons.shopping_bag_rounded,
                    label: 'Au panier',
                    value: '${state.cartItemsCount}',
                  ),
                ),
              ],
            ),
          ),
        ),

        // Categories filter
        if (categories.length > 1)
          SliverToBoxAdapter(
            child: SizedBox(
              height: 50,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final category = categories[index];
                  return _buildCategoryChip(category);
                },
              ),
            ),
          ),

        // Products count
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Text(
              '${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} disponible${filteredProducts.length > 1 ? 's' : ''}',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColor.textSecondary,
              ),
            ),
          ),
        ),

        // Products grid
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.75,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final product = filteredProducts[index];
                return ProductCard(
                  product: product,
                  isInCart: state.isInCart(product.id),
                  quantity: state.getQuantity(product.id),
                  onAdd: () {
                    context.read<OrderBloc>().add(
                          AddToCartRequested(produitId: product.id),
                        );
                  },
                  onRemove: () {
                    context.read<OrderBloc>().add(
                          RemoveFromCartRequested(product.id),
                        );
                  },
                  onIncrement: () {
                    context.read<OrderBloc>().add(
                          UpdateCartQuantityRequested(
                            produitId: product.id,
                            quantite: state.getQuantity(product.id) + 1,
                          ),
                        );
                  },
                  onDecrement: () {
                    context.read<OrderBloc>().add(
                          UpdateCartQuantityRequested(
                            produitId: product.id,
                            quantite: state.getQuantity(product.id) - 1,
                          ),
                        );
                  },
                );
              },
              childCount: filteredProducts.length,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColor.white, size: 20),
            const SizedBox(width: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: AppColor.white,
              ),
            ),
          ],
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

  Widget _buildCategoryChip(String category) {
    final isSelected = _selectedCategory == category;
    final displayName = category == 'all' ? 'Tous' : category;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(displayName),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedCategory = category;
          });
        },
        backgroundColor: AppColor.white,
        selectedColor: AppColor.primary,
        checkmarkColor: AppColor.white,
        labelStyle: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: isSelected ? AppColor.white : AppColor.textPrimary,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isSelected ? AppColor.primary : AppColor.border,
            width: 1.5,
          ),
        ),
        elevation: isSelected ? 4 : 0,
        shadowColor: AppColor.primary.withOpacity(0.3),
      ),
    );
  }

  Widget _buildCartFAB(ProductsLoaded state) {
    return Container(
      height: 60,
      margin: const EdgeInsets.symmetric(horizontal: 20),
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
            color: AppColor.primary.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: () {
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
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColor.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.shopping_bag_rounded,
                    color: AppColor.white,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Voir le panier',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColor.white,
                        ),
                      ),
                      Text(
                        '${state.cartItemsCount} article${state.cartItemsCount > 1 ? 's' : ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColor.white.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppColor.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${state.cartTotalAmount.toStringAsFixed(0)} F',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppColor.white,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.arrow_forward_rounded,
                  color: AppColor.white,
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}