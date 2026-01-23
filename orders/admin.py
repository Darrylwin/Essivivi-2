from django.contrib import admin
from .models import Commande, Notification


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'client', 'agent', 'quantite_demandee',
        'date_livraison_souhaitee', 'statut', 'created_at'
    ]
    list_filter = ['statut', 'date_livraison_souhaitee', 'created_at']
    search_fields = [
        'client__code_client', 'client__nom_point_vente',
        'agent__numero_identification', 'agent__nom'
    ]
    readonly_fields = ['created_at', 'updated_at', 'est_assignee', 'peut_etre_annulee']
    
    fieldsets = (
        ('Acteurs', {
            'fields': ('client', 'agent', 'est_assignee')
        }),
        ('Informations de la commande', {
            'fields': (
                'quantite_demandee', 'date_livraison_souhaitee',
                'adresse_livraison', 'statut', 'peut_etre_annulee'
            )
        }),
        ('Notes', {
            'fields': ('notes_client', 'notes_admin')
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