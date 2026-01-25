from django.contrib import admin
from .models import Commande, Notification


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'client', 'agent', 'quantite_demandee',
        'statut', 'created_at', 'latitude_livraison', 'longitude_livraison'
    ]
    list_filter = ['statut', 'created_at']
    search_fields = [
        'client__code_client', 'client__nom_point_vente',
        'agent__numero_identification', 'agent__nom'
    ]
    readonly_fields = ['created_at', 'updated_at', 'est_assignee', 'montant_total', 'quantite_totale']
    
    fieldsets = (
        ('Acteurs', {
            'fields': ('client', 'agent', 'est_assignee')
        }),
        ('Informations de la commande', {
            'fields': (
                'quantite_demandee', 'montant_total', 'quantite_totale',
                'latitude_livraison', 'longitude_livraison',
                'statut'
            )
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'titre', 'agent', 'client', 'lue', 'created_at']
    list_filter = ['type', 'lue', 'created_at']
    search_fields = ['titre', 'message']
    readonly_fields = ['created_at']