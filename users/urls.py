from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Tricycles
    TricycleViewSet,
    
    # Agents
    AgentListView, AgentCreateView, AgentDetailView,
    
    # Clients
    ClientListView, ClientCreateView, ClientDetailView,
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'tricycles', TricycleViewSet, basename='tricycle')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # ===== AGENTS =====
    path('admin/agents', AgentListView.as_view(), name='agent-list'),
    path('admin/agents/create', AgentCreateView.as_view(), name='agent-create'),
    path('admin/agents/<int:pk>', AgentDetailView.as_view(), name='agent-detail'),
    
    # ===== CLIENTS =====
    path('admin/clients', ClientListView.as_view(), name='client-list'),
    path('admin/clients/create', ClientCreateView.as_view(), name='client-create'),
    path('admin/clients/<int:pk>', ClientDetailView.as_view(), name='client-detail'),
]