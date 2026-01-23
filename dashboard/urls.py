from django.urls import path
from .views import (
    DashboardAdminView, DashboardAgentView,
    StatistiquesView, PerformanceAgentsView,
    HeuresPointeView, EvolutionTemporelleView,
    KPIView
)

urlpatterns = [
    # Dashboards principaux
    path('admin/dashboard', DashboardAdminView.as_view(), name='dashboard-admin'),
    path('agent/dashboard', DashboardAgentView.as_view(), name='dashboard-agent'),
    
    # Statistiques détaillées
    path('admin/statistiques', StatistiquesView.as_view(), name='statistiques'),
    path('admin/performance/agents', PerformanceAgentsView.as_view(), name='performance-agents'),
    path('admin/heures-pointe', HeuresPointeView.as_view(), name='heures-pointe'),
    path('admin/evolution', EvolutionTemporelleView.as_view(), name='evolution'),
    
    # KPI
    path('admin/kpi', KPIView.as_view(), name='kpi'),
]