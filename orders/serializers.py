from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from .models import Commande, Notification
from authentication.models import Agent, Client
import logging

logger = logging.getLogger('orders')


class CommandeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une commande"""
    
    class Meta:
        model = Commande
        fields = [
            'quantite_demandee', 'date_livraison_souhaitee',
            'adresse_livraison', 'notes_client'
        ]
    
    def validate_date_livraison_souhaitee(self, value):
        """Vérifier que la date n'est pas dans le passé"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "La date de livraison ne peut pas être dans le passé"
            )
        return value
    
    def create(self, validated_data):
        """Création de la commande"""
        request = self.context.get('request')
        
        # Récupérer le client
        try:
            client = Client.objects.get(email=request.user.email)
        except Client.DoesNotExist:
            raise serializers.ValidationError("Client non trouvé")
        
        # Créer la commande
        commande = Commande.objects.create(
            client=client,
            statut='en_attente',
            **validated_data
        )
        
        # Créer une notification pour les admins
        Notification.objects.create(
            type='nouvelle_commande',
            client=client,
            commande=commande,
            titre='Nouvelle commande',
            message=(
                f"Le client {client.nom_point_vente} ({client.code_client}) "
                f"a passé une nouvelle commande de {commande.quantite_demandee} unités."
            )
        )
        
        logger.info(
            f"Commande créée : #{commande.id} - Client {client.code_client} - "
            f"{commande.quantite_demandee} unités"
        )
        
        return commande


class CommandeListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les commandes"""
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    agent_nom = serializers.CharField(
        source='agent.nom',
        read_only=True,
        allow_null=True
    )
    est_assignee = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_code', 'client_nom',
            'agent', 'agent_numero', 'agent_nom', 'est_assignee',
            'quantite_demandee', 'date_livraison_souhaitee',
            'statut', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CommandeDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une commande"""
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    client_responsable = serializers.CharField(source='client.nom_responsable', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_adresse = serializers.CharField(source='client.adresse', read_only=True)
    
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    agent_nom = serializers.CharField(
        source='agent.nom',
        read_only=True,
        allow_null=True
    )
    agent_prenom = serializers.CharField(
        source='agent.prenom',
        read_only=True,
        allow_null=True
    )
    agent_telephone = serializers.CharField(
        source='agent.telephone',
        read_only=True,
        allow_null=True
    )
    
    est_assignee = serializers.BooleanField(read_only=True)
    peut_etre_annulee = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_code', 'client_nom', 'client_responsable',
            'client_telephone', 'client_adresse',
            'agent', 'agent_numero', 'agent_nom', 'agent_prenom', 'agent_telephone',
            'quantite_demandee', 'date_livraison_souhaitee', 'adresse_livraison',
            'statut', 'est_assignee', 'peut_etre_annulee',
            'notes_client', 'notes_admin',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommandeAssignSerializer(serializers.Serializer):
    """Serializer pour assigner une commande à un agent"""
    agent_id = serializers.IntegerField()
    
    def validate_agent_id(self, value):
        """Vérifier que l'agent existe et est actif"""
        try:
            agent = Agent.objects.get(id=value)
            if agent.statut == 'inactif':
                raise serializers.ValidationError("Cet agent est inactif")
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Agent non trouvé")
        return value


class CommandeStatusSerializer(serializers.Serializer):
    """Serializer pour changer le statut d'une commande"""
    statut = serializers.ChoiceField(
        choices=['en_attente', 'acceptee', 'en_cours', 'livree', 'annulee']
    )


class CommandeUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier une commande"""
    
    class Meta:
        model = Commande
        fields = [
            'quantite_demandee', 'date_livraison_souhaitee',
            'adresse_livraison', 'notes_client', 'notes_admin'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    client_code = serializers.CharField(
        source='client.code_client',
        read_only=True,
        allow_null=True
    )
    commande_id = serializers.IntegerField(
        source='commande.id',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'titre', 'message', 'lue',
            'agent', 'agent_numero',
            'client', 'client_code',
            'commande', 'commande_id',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']