from django.urls import path
from .views import (
    # Commandes
    CommandeListCreateView,
    CommandeDetailView,
    CommandeAssignView,
    CommandeStatusView,
    
    # Notifications
    NotificationListView,
    NotificationMarkAsReadView,
)

urlpatterns = [
    # ==================== COMMANDES ====================
    # GET: Liste commandes | POST: Créer commande (Client)
    path('orders', CommandeListCreateView.as_view(), name='order-list-create'),
    
    # GET: Détail commande | PUT/PATCH: Modifier commande | DELETE: Supprimer commande
    path('orders/<int:pk>', CommandeDetailView.as_view(), name='order-detail'),
    
    # POST: Assigner commande à un agent (Admin)
    path('orders/<int:pk>/assign', CommandeAssignView.as_view(), name='order-assign'),
    
    # PATCH: Changer le statut d'une commande (Admin ou Agent assigné)
    path('orders/<int:pk>/status', CommandeStatusView.as_view(), name='order-status'),
    
    # ==================== NOTIFICATIONS ====================
    # GET: Liste notifications
    path('notifications', NotificationListView.as_view(), name='notification-list'),
    
    # PATCH: Marquer notification comme lue
    path('notifications/<int:pk>/read', NotificationMarkAsReadView.as_view(), name='notification-read'),
]