from django.contrib import admin
from .models import Livraison


@admin.register(Livraison)
class LivraisonAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'agent', 'client', 'quantite_livree',
        'montant_percu', 'date_livraison', 'statut'
    ]
    list_filter = ['statut', 'date_livraison', 'agent']
    search_fields = [
        'agent__numero_identification', 'agent__nom',
        'client__code_client', 'client__nom_point_vente'
    ]
    readonly_fields = ['created_at', 'updated_at', 'distance_client']
    
    fieldsets = (
        ('Acteurs', {
            'fields': ('agent', 'client', 'tournee')
        }),
        ('Localisation', {
            'fields': ('latitude', 'longitude', 'distance_client')
        }),
        ('Informations de livraison', {
            'fields': (
                'quantite_livree', 'montant_percu',
                'date_livraison', 'heure_livraison',
                'duree_livraison', 'statut'
            )
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )