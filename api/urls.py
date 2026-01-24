from django.urls import path, include

urlpatterns = [
    # Module d'authentification
    path('', include('authentication.urls')),
    
    # Module de gestion des utilisateurs
    path('', include('users.urls')),
    
    # Module de gestion des tournées
    path('', include('tours.urls')),
    
    # Module de gestion des livraisons
    path('', include('deliveries.urls')),
    
    # Module de gestion des commandes
    path('', include('orders.urls')),
    
    # Module de suivi GPS
    path('', include('tracking.urls')),
    
    # Module dashboard et statistiques
    path('', include('dashboard.urls')),
    
    # Module produits et catégories
    path('', include('products.urls')),
]