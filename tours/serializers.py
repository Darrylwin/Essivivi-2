from rest_framework import serializers
from django.utils import timezone
from .models import Tournee
from authentication.models import Agent
import logging

logger = logging.getLogger('tours')


class TourneeSerializer(serializers.ModelSerializer):
    """Serializer pour les tournées"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    duree_formatee = serializers.CharField(read_only=True)
    est_terminee = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Tournee
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom',
            'heure_debut', 'heure_fin', 'duree', 'duree_formatee',
            'est_terminee', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duree']


class TourneeDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une tournée"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    agent_telephone = serializers.CharField(source='agent.telephone', read_only=True)
    duree_formatee = serializers.CharField(read_only=True)
    est_terminee = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Tournee
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom',
            'agent_telephone', 'heure_debut', 'heure_fin', 'duree',
            'duree_formatee', 'est_terminee', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duree']


class TourneeStartSerializer(serializers.Serializer):
    """Serializer pour démarrer une tournée"""
    # Pas de champs requis, tout est automatique
    pass


class TourneeEndSerializer(serializers.Serializer):
    """Serializer pour terminer une tournée"""
    # Pas de champs requis, tout est automatique
    pass