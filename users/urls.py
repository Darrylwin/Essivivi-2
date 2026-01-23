from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Tricycles
    TricycleViewSet,
    
    # Admins
    AdminListView, AdminCreateView, AdminDetailView,
    
    # Agents
    AgentListView, AgentCreateView, AgentDetailView, AgentStatusView,
    
    # Clients
    ClientListView, ClientCreateView, ClientDetailView, ClientStatusView,
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'tricycles', TricycleViewSet, basename='tricycle')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # ===== ADMINS =====
    path('admin/users', AdminListView.as_view(), name='admin-list'),
    path('admin/users/create', AdminCreateView.as_view(), name='admin-create'),
    path('admin/users/<int:pk>', AdminDetailView.as_view(), name='admin-detail'),
    
    # ===== AGENTS =====
    path('admin/agents', AgentList