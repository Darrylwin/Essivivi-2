from django.urls import path
from .views import TourneeDetailView, TourneeListView, TourneeStartView, TourneeEndView, TourneeCurrentView

urlpatterns = [
    # Les 3 endpoints CRITIQUES pour les livraisons
    path('tours/start', TourneeStartView.as_view(), name='tour-start'),
    path('tours/end', TourneeEndView.as_view(), name='tour-end'),
    path('tours/current', TourneeCurrentView.as_view(), name='tour-current'),

    # Consultation (Agent & Admin)
    path('tours', TourneeListView.as_view(), name='tour-list'),
    path('tours/<int:pk>', TourneeDetailView.as_view(), name='tour-detail'),
]