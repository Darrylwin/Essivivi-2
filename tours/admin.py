from django.contrib import admin
from .models import Tournee


@admin.register(Tournee)
class TourneeAdmin(admin.ModelAdmin):
    list_display = ['id', 'agent', 'heure_debut', 'heure_fin', 'duree_formatee', 'est_terminee']
    list_filter = ['heure_debut', 'heure_fin']
    search_fields = ['agent__numero_identification', 'agent__nom', 'agent__prenom']
    readonly_fields = ['created_at', 'updated_at', 'duree_formatee']
    
    def est_terminee_display(self, obj):
        return "Oui" if obj.est_terminee else "Non"
    est_terminee_display.short_description = 'Terminée'
    
    def duree_formatee(self, obj):
        """Affiche la durée sous forme lisible (ex: 1h 23m 45s)."""
        from django.utils import timezone
        if not obj.heure_debut:
            return "-"
        start = obj.heure_debut
        end = obj.heure_fin or timezone.now()
        duree = end - start
        total_seconds = int(duree.total_seconds())
        if total_seconds <= 0:
            return "-"
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours}h {minutes}m {seconds}s"
    duree_formatee.short_description = 'Durée'