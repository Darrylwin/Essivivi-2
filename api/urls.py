from django.urls import path, include

urlpatterns = [
    # Module d'authentification
    path('', include('authentication.urls')),
    
    # Module de gestion des utilisateurs
    path('', include('users.urls')),
    
    # Module de gestion des tournées
    path('', include('tours.urls')),
]