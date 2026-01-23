from django.urls import path
from .views import (
    CommandeCreateView, CommandeListView, CommandeDetailView,
    CommandeAssignView, CommandeStatusView,
    NotificationListView, NotificationMarkAsReadView
)

urlpatterns = [
    # Gestion des commandes
    path('orders', CommandeListView.as_view(), name='order-list'),
    path('orders/create', CommandeCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>', CommandeDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/assign', CommandeAssignView.as_view(), name='order-assign'),
    path('orders/<int:pk>/status', CommandeStatusView.as_view(), name='order-status'),
    
    # Gestion des notifications
    path('notifications', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read', NotificationMarkAsReadView.as_view(), name='notification-read'),
]