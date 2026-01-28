import 'package:flutter/material.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../domain/entities/product.dart';

/// Enhanced Product Card with modern design
class ProductCard extends StatelessWidget {
  final Product product;
  final bool isInCart;
  final int quantity;
  final VoidCallback onAdd;
  final VoidCallback onRemove;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const ProductCard({
    super.key,
    required this.product,
    required this.isInCart,
    required this.quantity,
    required this.onAdd,
    required this.onRemove,
    required this.onIncrement,
    required this.onDecrement,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColor.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Image with Badge
                Stack(
                  children: [
                    Center(
                      child: Hero(
                        tag: 'product-${product.id}',
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
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
                                color: AppColor.primary.withOpacity(0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: product.photo != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                  child: Image.network(
                                    product.photo!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Center(
                                      child: Icon(
                                        Icons.water_drop_rounded,
                                        size: 50,
                                        color: AppColor.white,
                                      ),
                                    ),
                                  ),
                                )
                              : const Center(
                                  child: Icon(
                                    Icons.water_drop_rounded,
                                    size: 50,
                                    color: AppColor.white,
                                  ),
                                ),
                        ),
                      ),
                    ),
                    // Stock badge
                    Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColor.success,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: AppColor.success.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.check_circle_rounded,
                              size: 12,
                              color: AppColor.white,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Dispo',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColor.white,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Category badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColor.secondary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColor.secondary.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    product.categorieNom.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppColor.secondary,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                // Brand
                Text(
                  product.marque,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColor.textSecondary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.3,
                  ),
                ),

                const SizedBox(height: 4),

                // Product name
                Text(
                  product.displayName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: AppColor.textPrimary,
                    height: 1.3,
                    letterSpacing: 0.2,
                  ),
                ),

                const SizedBox(height: 4),

                // Volume badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColor.grey100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.local_drink_outlined,
                            size: 12,
                            color: AppColor.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            product.volume,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColor.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const Spacer(),

                const SizedBox(height: 12),

                // Price and action
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Price
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Prix',
                            style: TextStyle(
                              fontSize: 10,
                              color: AppColor.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              '${product.prixUnitaire.toStringAsFixed(0)} F',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: AppColor.primary,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 8),

                    // Add to cart or quantity controls
                    if (!isInCart)
                      _buildAddButton()
                    else
                      _buildQuantityControls(),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAddButton() {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColor.primary,
            AppColor.primaryLight,
          ],
        ),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: AppColor.primary.withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onAdd,
          borderRadius: BorderRadius.circular(14),
          child: const Center(
            child: Icon(
              Icons.add_rounded,
              color: AppColor.white,
              size: 24,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuantityControls() {
    return Container(
      decoration: BoxDecoration(
        color: AppColor.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColor.primary.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Decrement/Remove button
          SizedBox(
            width: 36,
            height: 36,
            child: Material(
              color: Colors.transparent,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                bottomLeft: Radius.circular(12),
              ),
              child: InkWell(
                onTap: quantity > 1 ? onDecrement : onRemove,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
                child: Icon(
                  quantity > 1
                      ? Icons.remove_rounded
                      : Icons.delete_outline_rounded,
                  size: 18,
                  color: AppColor.primary,
                ),
              ),
            ),
          ),

          // Quantity display
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColor.primary.withOpacity(0.15),
              border: Border.symmetric(
                vertical: BorderSide(
                  color: AppColor.primary.withOpacity(0.3),
                  width: 1,
                ),
              ),
            ),
            child: Text(
              '$quantity',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: AppColor.primary,
              ),
            ),
          ),

          // Increment button
          SizedBox(
            width: 36,
            height: 36,
            child: Material(
              color: Colors.transparent,
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
              child: InkWell(
                onTap: onIncrement,
                borderRadius: const BorderRadius.only(
                  topRight: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
                child: const Icon(
                  Icons.add_rounded,
                  size: 18,
                  color: AppColor.primary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Empty state widget for products
class EmptyProductsState extends StatelessWidget {
  final VoidCallback onRetry;

  const EmptyProductsState({
    super.key,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
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
                Icons.water_drop_outlined,
                size: 70,
                color: AppColor.primary,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Aucun produit disponible',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColor.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Les produits apparaîtront ici\nune fois disponibles',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: AppColor.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Actualiser'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}