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


# ==================== AGENTS ====================

class AgentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un agent
    Génère automatiquement un mot de passe si non fourni
    """
    mot_de_passe = serializers.CharField(
        write_only=True,
        min_length=6,
        required=False,
        help_text="Mot de passe (6 caractères min). Si non fourni, sera généré automatiquement."
    )
    tricycle_id = serializers.PrimaryKeyRelatedField(
        queryset=Tricycle.objects.all(),
        source='tricycle',
        required=False,
        allow_null=True,
        help_text="ID du tricycle à assigner"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo de profil de l'agent"
    )
    
    class Meta:
        model = Agent
        fields = [
            'nom', 'prenom', 'telephone', 'email', 'date_naissance', 
            'adresse', 'photo', 'tricycle_id', 'mot_de_passe'
        ]
    
    def validate_email(self, value):
        """Vérifier que l'email est unique"""
        if Agent.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un agent avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier que le téléphone est unique"""
        if Agent.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Un agent avec ce numéro existe déjà")
        return value
    
    def create(self, validated_data):
        logger.info(f"Création d'un nouvel agent : {validated_data.get('email')}")
        
        # Générer un mot de passe si non fourni
        mot_de_passe = validated_data.pop('mot_de_passe', None)
        mot_de_passe_genere = None
        
        if not mot_de_passe:
            from django.utils.crypto import get_random_string
            mot_de_passe_genere = get_random_string(length=12)
            mot_de_passe = mot_de_passe_genere
            logger.info(f"Mot de passe généré pour l'agent")
        
        # Hasher le mot de passe
        validated_data['mot_de_passe'] = make_password(mot_de_passe)
        
        # Créer l'agent
        agent = Agent.objects.create(**validated_data)
        
        # Stocker le mot de passe généré temporairement pour la réponse
        if mot_de_passe_genere:
            agent._mot_de_passe_genere = mot_de_passe_genere
        
        logger.info(f"Agent créé : {agent.numero_identification}")
        return agent


class AgentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un agent"""
    tricycle_id = serializers.PrimaryKeyRelatedField(
        queryset=Tricycle.objects.all(),
        source='tricycle',
        required=False,
        allow_null=True,
        help_text="ID du tricycle. Null pour retirer le tricycle"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo de profil"
    )
    
    class Meta:
        model = Agent
        fields = [
            'nom', 'prenom', 'telephone', 'email', 'date_naissance',
            'adresse', 'photo', 'tricycle_id', 'statut'
        ]
    
    def validate_email(self, value):
        """Vérifier unicité email (sauf agent actuel)"""
        instance = self.instance
        if Agent.objects.filter(email=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("Un agent avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier unicité téléphone (sauf agent actuel)"""
        instance = self.instance
        if Agent.objects.filter(telephone=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("Un agent avec ce numéro existe déjà")
        return value
    
    def update(self, instance, validated_data):
        logger.info(f"Mise à jour agent : {instance.numero_identification}")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        logger.info(f"Agent mis à jour : {instance.numero_identification}")
        return instance

class AgentListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les agents"""
    tricycle_plaque = serializers.CharField(
        source='tricycle.plaque_immatriculation',
        read_only=True
    )
    
    class Meta:
        model = Agent
        fields = [
            'id', 'numero_identification', 'nom', 'prenom', 'telephone',
            'email', 'tricycle_plaque', 'statut', 'created_at'
        ]
        read_only_fields = ['id', 'numero_identification', 'created_at']


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


# ==================== CLIENTS ====================

class ClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un client (ADMIN UNIQUEMENT)
    Pour l'inscription mobile, voir authentication/serializers.py
    """
    mot_de_passe = serializers.CharField(
        write_only=True,
        min_length=6,
        required=True,
        help_text="Mot de passe (6 caractères min)"
    )
    photo_point_vente = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo du point de vente"
    )
    
    class Meta:
        model = Client
        fields = [
            'nom_point_vente', 'nom_responsable', 'telephone', 'email',
            'adresse', 'latitude', 'longitude', 'type_client',
            'photo_point_vente', 'mot_de_passe'
        ]
    
    def validate_email(self, value):
        """Vérifier unicité email"""
        if Client.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un client avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier unicité téléphone"""
        if Client.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Un client avec ce numéro existe déjà")
        return value
    
    def validate(self, data):
        """Validation des coordonnées GPS"""
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # Les deux doivent être fournies ensemble
        if (latitude is not None and longitude is None) or (longitude is not None and latitude is None):
            raise serializers.ValidationError(
                "La latitude et la longitude doivent être fournies ensemble"
            )
        
        # Vérifier les plages valides
        if latitude is not None:
            if not (-90 <= float(latitude) <= 90):
                raise serializers.ValidationError("Latitude invalide (doit être entre -90 et 90)")
        
        if longitude is not None:
            if not (-180 <= float(longitude) <= 180):
                raise serializers.ValidationError("Longitude invalide (doit être entre -180 et 180)")
        
        return data
    
    def create(self, validated_data):
        logger.info(f"Création client : {validated_data.get('nom_point_vente')}")
        
        # Hasher le mot de passe
        mot_de_passe = validated_data.pop('mot_de_passe')
        validated_data['mot_de_passe'] = make_password(mot_de_passe)
        
        client = Client.objects.create(**validated_data)
        logger.info(f"Client créé : {client.code_client}")
        return client


class ClientUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un client"""
    photo_point_vente = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo du point de vente"
    )
    
    class Meta:
        model = Client
        fields = [
            'nom_point_vente', 'nom_responsable', 'telephone', 'email',
            'adresse', 'latitude', 'longitude', 'type_client',
            'photo_point_vente', 'statut'
        ]
    
    def validate_email(self, value):
        """Vérifier unicité email (sauf client actuel)"""
        instance = self.instance
        if Client.objects.filter(email=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("Un client avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier unicité téléphone (sauf client actuel)"""
        instance = self.instance
        if Client.objects.filter(telephone=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("Un client avec ce numéro existe déjà")
        return value
    
    def validate(self, data):
        """Validation des coordonnées GPS"""
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if (latitude is not None and longitude is None) or (longitude is not None and latitude is None):
            raise serializers.ValidationError(
                "La latitude et la longitude doivent être fournies ensemble"
            )
        
        if latitude is not None:
            if not (-90 <= float(latitude) <= 90):
                raise serializers.ValidationError("Latitude invalide")
        
        if longitude is not None:
            if not (-180 <= float(longitude) <= 180):
                raise serializers.ValidationError("Longitude invalide")
        
        return data
    
    def update(self, instance, validated_data):
        logger.info(f"Mise à jour client : {instance.code_client}")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        logger.info(f"Client mis à jour : {instance.code_client}")
        return instance

class ClientListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les clients"""
    
    class Meta:
        model = Client
        fields = [
            'id', 'code_client', 'nom_point_vente', 'nom_responsable',
            'telephone', 'email', 'adresse', 'type_client', 'statut',
            'date_inscription'
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