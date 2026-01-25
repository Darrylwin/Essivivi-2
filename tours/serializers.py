from rest_framework import serializers
from django.utils import timezone
from .models import Tournee
from authentication.models import Agent
import logging

logger = logging.getLogger('tours')


class TourneeSerializer(serializers.ModelSerializer):
    """Serializer minimal pour les tournées"""
    
    class Meta:
        model = Tournee
        fields = ['id', 'agent', 'heure_debut', 'heure_fin', 'created_at']
        read_only_fields = ['id', 'created_at']


class TourneeDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une tournée avec statistiques"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    agent_telephone = serializers.CharField(source='agent.telephone', read_only=True)
    duree_formatee = serializers.CharField(read_only=True)
    est_terminee = serializers.BooleanField(read_only=True)
    
    # Statistiques de la tournée
    nombre_livraisons = serializers.SerializerMethodField()
    quantite_totale_livree = serializers.SerializerMethodField()
    montant_total_percu = serializers.SerializerMethodField()
    
    class Meta:
        model = Tournee
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom',
            'agent_telephone', 'heure_debut', 'heure_fin', 'duree',
            'duree_formatee', 'est_terminee',
            'nombre_livraisons', 'quantite_totale_livree', 'montant_total_percu',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duree']
    
    def get_nombre_livraisons(self, obj):
        """Nombre de livraisons effectuées lors de cette tournée"""
        return obj.livraisons.count()
    
    def get_quantite_totale_livree(self, obj):
        """Quantité totale livrée lors de cette tournée"""
        from decimal import Decimal
        total = sum(livraison.quantite_totale for livraison in obj.livraisons.all())
        return total if total > 0 else 0
    
    def get_montant_total_percu(self, obj):
        """Montant total perçu lors de cette tournée"""
        from decimal import Decimal
        total = sum(livraison.montant_total for livraison in obj.livraisons.all())
        return float(total) if total > 0 else 0.0
