from django.contrib import admin
from .models import Tournee


@admin.register(Tournee)
class TourneeAdmin(admin.ModelAdmin):
    list_display = ['id', 'agent', 'heure_debut', 'heure_fin', 'duree_formatee', 'est_terminee']
    list_filter = ['heure_debut', 'heure_fin']
    search_fields = ['agent__numero_identification', 'agent__nom', 'agent__prenom']
    readonly_fields = ['created_at', 'updated_at', 'duree']
    
    def est_terminee_display(self, obj):
        return "Oui" if obj.est_terminee else "Non"
    est_terminee_display.short_description = 'Terminée'
    
    def duree_formatee(self, obj):
        """Affiche la durée sous forme lisible (ex: 1h 23m 45s)."""
        duree = obj.duree or obj.calculer_duree()
        if not duree:
            return "-"
        total_seconds = int(duree.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours}h {minutes}m {seconds}s"
    duree_formatee.short_description = 'Durée'