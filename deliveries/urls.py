from django.urls import path
from .views import (
    LivraisonCreateView, LivraisonListView, LivraisonDetailView
)

urlpatterns = [
    # Gestion des livraisons
    path('deliveries', LivraisonListView.as_view(), name='delivery-list'),
    path('deliveries', LivraisonCreateView.as_view(), name='delivery-create'),
    path('deliveries/<int:pk>', LivraisonDetailView.as_view(), name='delivery-detail'),
]