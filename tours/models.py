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
    
    # NOUVEAU: Lier tournée à commande
    commande = models.ForeignKey(
        'orders.Commande',
        on_delete=models.CASCADE,
        related_name='tournees',
        verbose_name='Commande liée',
        help_text='Commande pour laquelle cette tournée est effectuée'
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
        
        indexes = [
            models.Index(fields=['agent', '-heure_debut']),
            models.Index(fields=['commande', '-heure_debut']),
        ]
    
    def __str__(self):
        return f"Tournée #{self.id} - Agent {self.agent.numero_identification} - Commande #{self.commande.id}"
    
    @property
    def est_terminee(self):
        """Vérifie si la tournée est terminée"""
        return self.heure_fin is not None
    
    @property
    def duree_formatee(self):
        """Retourne la durée formatée (ex: 2h 15m 30s)"""
        from django.utils import timezone
        
        if not self.heure_debut:
            return "-"
        
        end = self.heure_fin or timezone.now()
        duree = end - self.heure_debut
        total_seconds = int(duree.total_seconds())
        
        if total_seconds <= 0:
            return "-"
        
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        return f"{hours}h {minutes}m {seconds}s"
    
    @property
    def nombre_livraisons(self):
        """Nombre de livraisons effectuées lors de cette tournée"""
        return self.livraisons.count()
    
    @property
    def quantite_totale_livree(self):
        """Quantité totale livrée lors de cette tournée"""
        from decimal import Decimal
        total = sum(livraison.quantite_totale for livraison in self.livraisons.all())
        return total if total > 0 else 0
    
    @property
    def montant_total_percu(self):
        """Montant total perçu lors de cette tournée"""
        from decimal import Decimal
        total = sum(livraison.montant_total for livraison in self.livraisons.all())
        return float(total) if total > 0 else 0.0
    
    def peut_etre_terminee(self):
        """
        Vérifie si la tournée peut être terminée
        
        Conditions:
        1. Tournée ne doit pas être déjà terminée
        2. Commande doit être livrée (statut='livree')
        """
        if self.est_terminee:
            return False, "Tournée déjà terminée"
        
        if self.commande.statut != 'livree':
            return False, f"La commande n'est pas encore livrée (statut: {self.commande.statut})"
        
        return True, "Tournée peut être terminée"