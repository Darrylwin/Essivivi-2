from django.contrib import admin
from .models import Categorie, Produit


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'nombre_produits', 'actif', 'created_at']
    list_filter = ['actif']
    search_fields = ['nom', 'description']
    ordering = ['nom']  # Tri alphabétique


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = [
        'nom_complet', 'categorie', 'marque', 'volume',
        'prix_unitaire', 'unite_vente', 'actif'
    ]
    list_filter = ['categorie', 'actif', 'unite_vente', 'marque']
    search_fields = ['nom', 'marque']
    ordering = ['categorie', 'marque', 'nom']
    readonly_fields = ['created_at', 'updated_at']
    
    def nom_complet(self, obj):
        """Affiche le nom complet du produit"""
        return obj.nom_complet
    nom_complet.short_description = 'Produit'