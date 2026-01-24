from django.urls import path
from .views import (
    # Catégories
    CategorieListView, CategorieCreateView, CategorieDetailView,
    
    # Produits
    ProduitListView, ProduitCreateView, ProduitDetailView,
)

urlpatterns = [
    # ===== CATÉGORIES =====
    path('categories', CategorieListView.as_view(), name='categorie-list'),
    path('categories/create', CategorieCreateView.as_view(), name='categorie-create'),
    path('categories/<int:pk>', CategorieDetailView.as_view(), name='categorie-detail'),
    
    # ===== PRODUITS =====
    path('produits', ProduitListView.as_view(), name='produit-list'),
    path('produits/create', ProduitCreateView.as_view(), name='produit-create'),
    path('produits/<int:pk>', ProduitDetailView.as_view(), name='produit-detail'),
]