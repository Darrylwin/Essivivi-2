from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Tricycles
    TricycleViewSet,
    
    # Agents
    AgentListCreateView,
    AgentDetailView,
    AgentChangePasswordView,
    
    # Clients
    ClientListCreateView,
    ClientDetailView,
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'tricycles', TricycleViewSet, basename='tricycle')

urlpatterns = [
    # Router URLs (pour les tricycles)
    path('', include(router.urls)),
    
    # ==================== AGENTS ====================
    # GET: Liste agents | POST: Créer agent
    path('admin/agents', AgentListCreateView.as_view(), name='agent-list-create'),
    
    # GET: Détail agent | PUT/PATCH: Modifier agent | DELETE: Supprimer agent
    path('admin/agents/<int:pk>', AgentDetailView.as_view(), name='agent-detail'),
    
    # POST: Changer mot de passe agent
    path('admin/agents/<int:pk>/change-password', AgentChangePasswordView.as_view(), name='agent-change-password'),
    
    # ==================== CLIENTS ====================
    # GET: Liste clients | POST: Créer client
    path('admin/clients', ClientListCreateView.as_view(), name='client-list-create'),
    
    # GET: Détail client | PUT/PATCH: Modifier client | DELETE: Supprimer client
    path('admin/clients/<int:pk>', ClientDetailView.as_view(), name='client-detail'),
]