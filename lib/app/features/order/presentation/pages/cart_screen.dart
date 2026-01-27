import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';
import '../../domain/repositories/order_repository.dart';

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
        const SnackBar(
          content: Text('Votre panier est vide'),
          backgroundColor: AppColor.warning,
        ),
      );
      return;
    }

    // Convert cart to OrderLineItems
    final lignes = state.cart.entries
        .map((entry) => OrderLineItem(
              produitId: entry.key,
              quantite: entry.value,
            ))
        .toList();

    // Create order
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
        backgroundColor: AppColor.primary,
      ),
      body: BlocConsumer<OrderBloc, OrderState>(
        listener: (context, state) {
          if (state is OrderCreated) {
            // Success!
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColor.success,
              ),
            );

            // Navigate back and reload products
            Navigator.pop(context);
            context.read<OrderBloc>().add(const LoadProductsRequested());
          } else if (state is OrderError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColor.error,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is OrderCreating) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Création de la commande...'),
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
                    const Icon(
                      Icons.shopping_cart_outlined,
                      size: 100,
                      color: AppColor.grey300,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Votre panier est vide',
                      style: TextStyle(
                        fontSize: 18,
                        color: AppColor.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Continuer mes achats'),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: [
                // Cart items list
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: state.cart.length,
                    itemBuilder: (context, index) {
                      final entry = state.cart.entries.elementAt(index);
                      final produitId = entry.key;
                      final quantite = entry.value;

                      final product = state.products.firstWhere(
                        (p) => p.id == produitId,
                      );

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              // Product image
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: AppColor.primarySoft,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(
                                  Icons.water_drop,
                                  color: AppColor.primary,
                                  size: 30,
                                ),
                              ),

                              const SizedBox(width: 12),

                              // Product info
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      product.displayName,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${product.prixUnitaire.toStringAsFixed(0)} FCFA',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColor.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Quantity controls
                              Row(
                                children: [
                                  IconButton(
                                    onPressed: () {
                                      if (quantite > 1) {
                                        context.read<OrderBloc>().add(
                                              UpdateCartQuantityRequested(
                                                produitId: produitId,
                                                quantite: quantite - 1,
                                              ),
                                            );
                                      }
                                    },
                                    icon: const Icon(Icons.remove, size: 18),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(
                                      minWidth: 32,
                                      minHeight: 32,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColor.primarySoft,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '$quantite',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: AppColor.primary,
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: () {
                                      context.read<OrderBloc>().add(
                                            UpdateCartQuantityRequested(
                                              produitId: produitId,
                                              quantite: quantite + 1,
                                            ),
                                          );
                                    },
                                    icon: const Icon(Icons.add, size: 18),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(
                                      minWidth: 32,
                                      minHeight: 32,
                                    ),
                                  ),
                                ],
                              ),

                              // Delete button
                              IconButton(
                                onPressed: () {
                                  context.read<OrderBloc>().add(
                                        RemoveFromCartRequested(produitId),
                                      );
                                },
                                icon: const Icon(Icons.delete_outline),
                                color: AppColor.error,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Summary and checkout
                Container(
                  decoration: const BoxDecoration(
                    color: AppColor.white,
                    boxShadow: [
                      BoxShadow(
                        color: AppColor.shadow,
                        blurRadius: 10,
                        offset: Offset(0, -2),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Address option
                      CheckboxListTile(
                        value: _useClientAddress,
                        onChanged: (value) {
                          setState(() {
                            _useClientAddress = value ?? true;
                          });
                        },
                        title: const Text('Utiliser mon adresse enregistrée'),
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppColor.primary,
                      ),

                      if (!_useClientAddress) ...[
                        const SizedBox(height: 8),
                        CustomTextField(
                          controller: _addressController,
                          label: 'Adresse de livraison',
                          hint: 'Entrez l\'adresse complète',
                          icon: Icons.location_on_outlined,
                          maxLines: 2,
                        ),
                      ],

                      const SizedBox(height: 16),

                      // Summary
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total articles:',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColor.textSecondary,
                            ),
                          ),
                          Text(
                            '${state.cartItemsCount}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 8),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Montant Total:',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${state.cartTotalAmount.toStringAsFixed(0)} FCFA',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColor.primary,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Checkout button
                      PrimaryButton(
                        text: 'Valider la commande',
                        onPressed: () => _handleCheckout(state),
                        icon: Icons.check_circle_outline,
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
}