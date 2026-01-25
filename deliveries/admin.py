from django.contrib import admin
from .models import Livraison, LigneLivraison


@admin.register(Livraison)
class LivraisonAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'agent', 'client', 'commande', 'quantite_livree',
        'montant_percu', 'date_livraison', 'statut'
    ]
    list_filter = ['statut', 'date_livraison', 'agent', 'commande']
    search_fields = [
        'agent__numero_identification', 'agent__nom',
        'client__code_client', 'client__nom_point_vente',
        'commande__id'
    ]
    readonly_fields = ['created_at', 'updated_at', 'distance_client', 'distance_commande', 'montant_total', 'quantite_totale']
    
    fieldsets = (
        ('Acteurs', {
            'fields': ('agent', 'client', 'commande', 'tournee')
        }),
        ('Localisation', {
            'fields': ('latitude', 'longitude', 'distance_client', 'distance_commande')
        }),
        ('Informations de livraison', {
            'fields': (
                'quantite_livree', 'montant_percu', 'montant_total', 'quantite_totale',
                'date_livraison', 'heure_livraison',
                'duree_livraison', 'statut'
            )
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(LigneLivraison)
class LigneLivraisonAdmin(admin.ModelAdmin):
    list_display = ['id', 'livraison', 'produit', 'quantite', 'montant', 'ligne_commande']
    list_filter = ['produit']
    search_fields = ['produit__nom', 'livraison__id']
    readonly_fields = ['montant', 'created_at']