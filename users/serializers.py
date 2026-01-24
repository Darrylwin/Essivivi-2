from rest_framework import serializers
from authentication.models import Agent, Client, Tricycle
from django.contrib.auth.hashers import make_password
import logging

logger = logging.getLogger('users')


class TricycleSerializer(serializers.ModelSerializer):
    """Serializer pour les tricycles"""
    
    class Meta:
        model = Tricycle
        fields = ['id', 'plaque_immatriculation', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AgentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un agent"""
    mot_de_passe = serializers.CharField(write_only=True, min_length=6, required=False)
    tricycle_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'numero_identification', 'nom', 'prenom', 'telephone', 
            'email', 'date_naissance', 'adresse', 'photo', 'tricycle_id',
            'mot_de_passe', 'statut'
        ]
        read_only_fields = ['id', 'numero_identification']
    
    def validate_tricycle_id(self, value):
        """Vérifie que le tricycle existe"""
        if value is not None:
            try:
                Tricycle.objects.get(id=value)
            except Tricycle.DoesNotExist:
                logger.warning(f"Tricycle ID {value} n'existe pas")
                raise serializers.ValidationError("Le tricycle spécifié n'existe pas")
        return value
    
    def create(self, validated_data):
        logger.info(f"Création d'un nouvel agent : {validated_data.get('email')}")
        
        tricycle_id = validated_data.pop('tricycle_id', None)
        mot_de_passe = validated_data.pop('mot_de_passe', None)
        
        # Générer un mot de passe par défaut si non fourni
        if not mot_de_passe:
            mot_de_passe = Agent.objects.make_random_password(length=8)
            logger.info(f"Mot de passe par défaut généré pour l'agent {validated_data.get('email')}")
        
        # Hasher le mot de passe
        validated_data['mot_de_passe'] = make_password(mot_de_passe)
        
        # Associer le tricycle si fourni
        if tricycle_id:
            validated_data['tricycle_id'] = tricycle_id
        
        agent = Agent.objects.create(**validated_data)
        
        logger.info(f"Agent créé avec succès : {agent.numero_identification}")
        return agent


class AgentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un agent"""
    tricycle_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Agent
        fields = [
            'nom', 'prenom', 'telephone', 'email', 'date_naissance', 
            'adresse', 'photo', 'tricycle_id', 'statut'
        ]
    
    def validate_tricycle_id(self, value):
        """Vérifie que le tricycle existe"""
        if value is not None:
            try:
                Tricycle.objects.get(id=value)
            except Tricycle.DoesNotExist:
                raise serializers.ValidationError("Le tricycle spécifié n'existe pas")
        return value
    
    def update(self, instance, validated_data):
        logger.info(f"Mise à jour de l'agent : {instance.numero_identification}")
        
        tricycle_id = validated_data.pop('tricycle_id', None)
        
        # Mettre à jour les champs standard
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Mettre à jour le tricycle si fourni
        if tricycle_id is not None:
            if tricycle_id == 0:  # 0 pour retirer le tricycle
                instance.tricycle = None
            else:
                instance.tricycle_id = tricycle_id
        
        instance.save()
        
        logger.info(f"Agent mis à jour avec succès : {instance.numero_identification}")
        return instance


class AgentListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les agents"""
    tricycle_plaque = serializers.CharField(source='tricycle.plaque_immatriculation', read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'numero_identification', 'nom', 'prenom', 'telephone', 
            'email', 'date_naissance', 'adresse', 'photo', 'tricycle_plaque',
            'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'numero_identification', 'created_at', 'updated_at']


class AgentDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un agent"""
    tricycle = TricycleSerializer(read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'numero_identification', 'nom', 'prenom', 'telephone', 
            'email', 'date_naissance', 'adresse', 'photo', 'tricycle',
            'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'numero_identification', 'created_at', 'updated_at']

class ClientCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un client"""
    
    class Meta:
        model = Client
        fields = [
            'id', 'code_client', 'nom_point_vente', 'nom_responsable', 
            'telephone', 'email', 'adresse', 'latitude', 'longitude',
            'type_client', 'photo_point_vente', 'statut'
        ]
        read_only_fields = ['id', 'code_client']
    
    def create(self, validated_data):
        logger.info(f"Création d'un nouveau client : {validated_data.get('nom_point_vente')}")
        
        client = Client.objects.create(**validated_data)
        
        logger.info(f"Client créé avec succès : {client.code_client}")
        return client


class ClientUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un client"""
    
    class Meta:
        model = Client
        fields = [
            'nom_point_vente', 'nom_responsable', 'telephone', 'email', 
            'adresse', 'latitude', 'longitude', 'type_client', 
            'photo_point_vente', 'statut'
        ]


class ClientListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les clients"""
    
    class Meta:
        model = Client
        fields = [
            'id', 'code_client', 'nom_point_vente', 'nom_responsable', 
            'telephone', 'email', 'adresse', 'latitude', 'longitude',
            'type_client', 'statut', 'date_inscription'
        ]
        read_only_fields = ['id', 'code_client', 'date_inscription']


class ClientDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un client"""
    
    class Meta:
        model = Client
        fields = [
            'id', 'code_client', 'nom_point_vente', 'nom_responsable', 
            'telephone', 'email', 'adresse', 'latitude', 'longitude',
            'type_client', 'photo_point_vente', 'statut', 'date_inscription',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code_client', 'date_inscription', 'created_at', 'updated_at']
