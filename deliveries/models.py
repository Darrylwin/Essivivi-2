from django.db import models
from authentication.models import Agent, Client
from tours.models import Tournee
from decimal import Decimal
import math


class Livraison(models.Model):
    """Modèle pour les livraisons effectuées par les agents"""
    
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('validee', 'Validée'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    
    agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name='livraisons',
        verbose_name='Agent'
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='livraisons',
        verbose_name='Client'
    )
    tournee = models.ForeignKey(
        Tournee,
        on_delete=models.CASCADE,
        related_name='livraisons',
        verbose_name='Tournée',
        null=True,
        blank=True
    )
    
    # Coordonnées GPS de la livraison
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        verbose_name='Latitude'
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        verbose_name='Longitude'
    )
    
    # Informations de livraison
    quantite_livree = models.IntegerField(verbose_name='Quantité livrée')
    montant_percu = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant perçu (FCFA)'
    )
    
    # Date et heure
    date_livraison = models.DateField(verbose_name='Date de livraison')
    heure_livraison = models.TimeField(verbose_name='Heure de livraison')
    duree_livraison = models.DurationField(
        null=True,
        blank=True,
        verbose_name='Durée de la livraison'
    )
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='livree',
        verbose_name='Statut'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'livraisons'
        verbose_name = 'Livraison'
        verbose_name_plural = 'Livraisons'
        ordering = ['-date_livraison', '-heure_livraison']
    
    def __str__(self):
        return f"Livraison #{self.id} - {self.agent.numero_identification} → {self.client.code_client}"
    
    @staticmethod
    def calculer_distance(lat1, lon1, lat2, lon2):
        """
        Calcule la distance en mètres entre deux points GPS
        Utilise la formule de Haversine
        """
        # Convertir en float
        lat1, lon1 = float(lat1), float(lon1)
        lat2, lon2 = float(lat2), float(lon2)
        
        # Rayon de la Terre en mètres
        R = 6371000
        
        # Convertir en radians
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        # Formule de Haversine
        a = math.sin(delta_phi/2)**2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        distance = R * c
        return distance
    
    @property
    def distance_client(self):
        """Calcule la distance entre la livraison et l'adresse du client"""
        if self.client.latitude and self.client.longitude:
            return self.calculer_distance(
                self.latitude,
                self.longitude,
                self.client.latitude,
                self.client.longitude
            )
        return None