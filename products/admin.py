from django.contrib import admin
from .models import Categorie, Produit


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'ordre', 'nombre_produits', 'actif', 'created_at']
    list_filter = ['actif']
    search_fields = ['nom', 'description']
    ordering = ['ordre', 'nom']


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = [
        'reference', 'nom', 'categorie', 'marque', 'volume',
        'prix_unitaire', 'unite_vente', 'actif'
    ]
    list_filter = ['categorie', 'actif', 'unite_vente', 'marque']
    search_fields = ['nom', 'reference', 'marque', 'description']
    ordering = ['categorie', 'ordre', 'nom']
    readonly_fields = ['created_at', 'updated_at']