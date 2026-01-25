from django.db import models
from authentication.models import Agent


class Tournee(models.Model):
    """Modèle pour les tournées des agents"""
    
    agent = models.ForeignKey(
        Agent, 
        on_delete=models.CASCADE, 
        related_name='tournees',
        verbose_name='Agent'
    )
    heure_debut = models.DateTimeField(verbose_name='Heure de début')
    heure_fin = models.DateTimeField(null=True, blank=True, verbose_name='Heure de fin')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tournees'
        verbose_name = 'Tournée'
        verbose_name_plural = 'Tournées'
        ordering = ['-heure_debut']
    
    def __str__(self):
        return f"Tournée #{self.id} - Agent {self.agent.numero_identification}"
    
    @property
    def est_terminee(self):
        """Vérifie si la tournée est terminée"""
        return self.heure_fin is not None