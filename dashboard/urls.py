from django.urls import path
from .views import DashboardAdminView

urlpatterns = [
    # Dashboards principaux
    path('admin/dashboard', DashboardAdminView.as_view(), name='dashboard-admin'),
]