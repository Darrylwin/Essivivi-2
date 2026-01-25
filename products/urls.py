from django.urls import path
from .views import (
    # Catégories
    CategorieListCreateView,
    CategorieDetailView,
    
    # Produits
    ProduitListCreateView,
    ProduitDetailView,
)

urlpatterns = [
    # ==================== CATÉGORIES ====================
    # GET: Liste catégories | POST: Créer catégorie
    path('categories', CategorieListCreateView.as_view(), name='categorie-list-create'),
    
    # GET: Détail catégorie | PUT/PATCH: Modifier catégorie | DELETE: Supprimer catégorie
    path('categories/<int:pk>', CategorieDetailView.as_view(), name='categorie-detail'),
    
    # ==================== PRODUITS ====================
    # GET: Liste produits | POST: Créer produit
    path('produits', ProduitListCreateView.as_view(), name='produit-list-create'),
    
    # GET: Détail produit | PUT/PATCH: Modifier produit | DELETE: Supprimer produit
    path('produits/<int:pk>', ProduitDetailView.as_view(), name='produit-detail'),
]