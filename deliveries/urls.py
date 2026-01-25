from django.urls import path
from .views import (
    LivraisonCreateView, LivraisonListView, LivraisonDetailView,
    LivraisonsCommandesEnCoursView
)

urlpatterns = [
    # Gestion des livraisons
    path('deliveries', LivraisonListView.as_view(), name='delivery-list'),
    path('deliveries/create', LivraisonCreateView.as_view(), name='delivery-create'),
    path('deliveries/<int:pk>', LivraisonDetailView.as_view(), name='delivery-detail'),
    
    # Commandes en attente de livraison pour l'agent
    path('deliveries/pending-orders', LivraisonsCommandesEnCoursView.as_view(), name='delivery-pending-orders'),
]