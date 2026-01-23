from django.urls import path
from .views import (
    TourneeStartView, TourneeEndView, TourneeListView,
    TourneeDetailView, TourneeCurrentView
)

urlpatterns = [
    # Gestion des tournées (Agent)
    path('tours/start', TourneeStartView.as_view(), name='tour-start'),
    path('tours/end', TourneeEndView.as_view(), name='tour-end'),
    path('tours/current', TourneeCurrentView.as_view(), name='tour-current'),
    
    # Consultation (Agent & Admin)
    path('tours', TourneeListView.as_view(), name='tour-list'),
    path('tours/<int:pk>', TourneeDetailView.as_view(), name='tour-detail'),
]