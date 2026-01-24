from django.urls import path
from .views import (
    DashboardAdminView, DashboardAgentView, PerformanceAgentsView,
    KPIView
)

urlpatterns = [
    # Dashboards principaux
    path('admin/dashboard', DashboardAdminView.as_view(), name='dashboard-admin'),
    path('agent/dashboard', DashboardAgentView.as_view(), name='dashboard-agent'),
    
    # Statistiques détaillées
    path('admin/performance/agents', PerformanceAgentsView.as_view(), name='performance-agents'),
    
    # KPI
    path('admin/kpi', KPIView.as_view(), name='kpi'),
]