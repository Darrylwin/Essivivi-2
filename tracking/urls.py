from django.urls import path
from .views import (
    PositionCreateView, PositionListView, PositionDetailView,
    AgentDernierePositionView, AgentsEnTourneeView, ParcoursAgentView
)

urlpatterns = [
    # Gestion des positions GPS
    path('agents/position', PositionCreateView.as_view(), name='position-create'),
    path('agents/positions', PositionListView.as_view(), name='position-list'),
    path('agents/positions/<int:pk>', PositionDetailView.as_view(), name='position-detail'),
    
    # Suivi en temps réel
    path('agents/<int:agent_id>/position/latest', AgentDernierePositionView.as_view(), name='agent-derniere-position'),
    path('agents/<int:agent_id>/parcours', ParcoursAgentView.as_view(), name='agent-parcours'),
    path('admin/live/agents', AgentsEnTourneeView.as_view(), name='agents-en-tournee'),
]