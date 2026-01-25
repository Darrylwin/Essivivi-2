from django.urls import path
from .views import (
    PositionCreateView, PositionListView, PositionDetailView,
    AgentDernierePositionView, AgentsEnTourneeView, ParcoursAgentView
)

urlpatterns = [
    # Gestion des positions GPS
    path('tracking/agents/position', PositionCreateView.as_view(), name='position-create'),
    path('tracking/agents/positions', PositionListView.as_view(), name='position-list'),
    path('tracking/agents/positions/<int:pk>', PositionDetailView.as_view(), name='position-detail'),
    
    # Suivi en temps réel
    path('tracking/agents/<int:agent_id>/position/latest', AgentDernierePositionView.as_view(), name='agent-derniere-position'),
    path('tracking/agents/<int:agent_id>/parcours', ParcoursAgentView.as_view(), name='agent-parcours'),
    path('tracking/admin/live/agents', AgentsEnTourneeView.as_view(), name='agents-en-tournee'),
]