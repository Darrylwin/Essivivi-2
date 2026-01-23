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
    path('admin/agents', AgentListView.as_view(), name='agent-list'),
    path('admin/agents/create', AgentCreateView.as_view(), name='agent-create'),
    path('admin/agents/<int:pk>', AgentDetailView.as_view(), name='agent-detail'),
    path('admin/agents/<int:pk>/status', AgentStatusView.as_view(), name='agent-status'),
    
    # ===== CLIENTS =====
    path('clients', ClientListView.as_view(), name='client-list'),
    path('clients/create', ClientCreateView.as_view(), name='client-create'),
    path('clients/<int:pk>', ClientDetailView.as_view(), name='client-detail'),
    path('clients/<int:pk>/status', ClientStatusView.as_view(), name='client-status'),
]