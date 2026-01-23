from django.contrib import admin
from .models import PositionAgent


@admin.register(PositionAgent)
class PositionAgentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'agent', 'latitude', 'longitude',
        'vitesse', 'precision', 'timestamp'
    ]
    list_filter = ['timestamp', 'agent']
    search_fields = ['agent__numero_identification', 'agent__nom']
    readonly_fields = ['timestamp']
    
    fieldsets = (
        ('Agent', {
            'fields': ('agent', 'tournee')
        }),
        ('Position GPS', {
            'fields': ('latitude', 'longitude', 'precision', 'altitude')
        }),
        ('Déplacement', {
            'fields': ('vitesse',)
        }),
        ('Horodatage', {
            'fields': ('timestamp',)
        }),
    )