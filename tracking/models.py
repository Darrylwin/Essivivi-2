from django.db import models
from authentication.models import Agent
from tours.models import Tournee
import math
from decimal import Decimal


class PositionAgent(models.Model):
    """Modèle pour le suivi GPS en temps réel des agents"""
    
    agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name='positions',
        verbose_name='Agent'
    )
    tournee = models.ForeignKey(
        Tournee,
        on_delete=models.CASCADE,
        related_name='positions',
        verbose_name='Tournée',
        null=True,
        blank=True
    )
    
    # Coordonnées GPS
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
    
    # Précision et vitesse (optionnels)
    precision = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Précision (mètres)',
        help_text='Précision de la localisation GPS en mètres'
    )
    vitesse = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Vitesse (km/h)',
        help_text='Vitesse de déplacement en km/h'
    )
    altitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Altitude (mètres)'
    )
    
    # Horodatage
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Horodatage'
    )
    
    class Meta:
        db_table = 'positions_agents'
        verbose_name = 'Position Agent'
        verbose_name_plural = 'Positions Agents'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['agent', '-timestamp']),
            models.Index(fields=['tournee', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.agent.numero_identification} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
    
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
    
    @classmethod
    def get_derniere_position(cls, agent):
        """Récupère la dernière position enregistrée d'un agent"""
        return cls.objects.filter(agent=agent).order_by('-timestamp').first()
    
    @classmethod
    def calculer_temps_estime(cls, agent_lat, agent_lon, dest_lat, dest_lon, vitesse_moyenne=20):
        """
        Calcule le temps estimé d'arrivée
        vitesse_moyenne en km/h (par défaut 20 km/h pour un tricycle)
        Retourne le temps en minutes
        """
        distance_metres = cls.calculer_distance(agent_lat, agent_lon, dest_lat, dest_lon)
        distance_km = distance_metres / 1000
        temps_heures = distance_km / vitesse_moyenne
        temps_minutes = temps_heures * 60
        return round(temps_minutes, 1)
    
    def distance_depuis_derniere_position(self):
        """Calcule la distance parcourue depuis la dernière position enregistrée"""
        positions_precedentes = PositionAgent.objects.filter(
            agent=self.agent,
            timestamp__lt=self.timestamp
        ).order_by('-timestamp')
        
        if positions_precedentes.exists():
            derniere = positions_precedentes.first()
            return self.calculer_distance(
                derniere.latitude,
                derniere.longitude,
                self.latitude,
                self.longitude
            )
        return 0