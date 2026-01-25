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
    
    Si mot_de_passe n'est pas fourni, un mot de passe aléatoire est généré
    et retourné dans la réponse
    """
    mot_de_passe = serializers.CharField(
        write_only=True,
        min_length=6,
        required=False,
        help_text="Mot de passe (6 caractères min). Si non fourni, un mot de passe sera généré."
    )
    tricycle_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID du tricycle à assigner (optionnel)"
    )
    mot_de_passe_genere = serializers.CharField(
        read_only=True,
        help_text="Mot de passe généré automatiquement (si applicable)"
    )
    
    class Meta:
        model = Agent
        fields = [
            'id', 'numero_identification', 'nom', 'prenom', 'telephone', 
            'email', 'date_naissance', 'adresse', 'photo', 'tricycle_id',
            'mot_de_passe', 'mot_de_passe_genere', 'statut'
        ]
        read_only_fields = ['id', 'numero_identification']
    
    def validate_email(self, value):
        """Vérifier que l'email est unique"""
        if Agent.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un agent avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier que le téléphone est unique"""
        if Agent.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Un agent avec ce numéro de téléphone existe déjà")
        return value
    
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
        mot_de_passe_genere = None
        if not mot_de_passe:
            from django.utils.crypto import get_random_string
            mot_de_passe_genere = get_random_string(length=10)
            mot_de_passe = mot_de_passe_genere
            logger.info(f"Mot de passe généré pour l'agent {validated_data.get('email')}")
        
        # Hasher le mot de passe
        validated_data['mot_de_passe'] = make_password(mot_de_passe)
        
        # Associer le tricycle si fourni
        if tricycle_id:
            validated_data['tricycle_id'] = tricycle_id
        
        agent = Agent.objects.create(**validated_data)
        
        # Ajouter le mot de passe généré à l'instance (pour le retourner dans la réponse)
        if mot_de_passe_genere:
            agent.mot_de_passe_genere = mot_de_passe_genere
        
        logger.info(f"Agent créé avec succès : {agent.numero_identification}")
        return agent


class AgentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un agent"""
    tricycle_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID du tricycle. Mettre null pour retirer le tricycle"
    )
    
    class Meta:
        model = Agent
        fields = [
            'nom', 'prenom', 'telephone', 'email', 'date_naissance', 
            'adresse', 'photo', 'tricycle_id', 'statut'
        ]
    
    def validate_email(self, value):
        """Vérifier que l'email est unique (sauf pour l'agent actuel)"""
        instance = self.instance
        if Agent.objects.filter(email=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Un agent avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier que le téléphone est unique (sauf pour l'agent actuel)"""
        instance = self.instance
        if Agent.objects.filter(telephone=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Un agent avec ce numéro de téléphone existe déjà")
        return value
    
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
        
        # Mettre à jour le tricycle
        if 'tricycle_id' in self.initial_data:  # Vérifie que le champ a été envoyé
            if tricycle_id is None:
                instance.tricycle = None
                logger.info(f"Tricycle retiré de l'agent {instance.numero_identification}")
            else:
                instance.tricycle_id = tricycle_id
                logger.info(f"Tricycle {tricycle_id} assigné à l'agent {instance.numero_identification}")
        
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


# ==================== CLIENTS ====================

class ClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un client
    
    IMPORTANT: Ce serializer est utilisé par l'ADMIN uniquement.
    L'inscription client via mobile utilise ClientRegisterSerializer dans authentication/
    """
    mot_de_passe = serializers.CharField(
        write_only=True,
        min_length=6,
        required=True,
        help_text="Mot de passe pour la connexion mobile (6 caractères min)"
    )
    
    class Meta:
        model = Client
        fields = [
            'id', 'code_client', 'nom_point_vente', 'nom_responsable', 
            'telephone', 'email', 'adresse', 'latitude', 'longitude',
            'type_client', 'photo_point_vente', 'mot_de_passe', 'statut'
        ]
        read_only_fields = ['id', 'code_client']
    
    def validate_email(self, value):
        """Vérifier que l'email est unique"""
        if Client.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un client avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier que le téléphone est unique"""
        if Client.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Un client avec ce numéro de téléphone existe déjà")
        return value
    
    def validate(self, data):
        """Validations supplémentaires"""
        # Vérifier que les coordonnées GPS sont cohérentes
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # Si l'une est fournie, l'autre doit l'être aussi
        if (latitude is not None and longitude is None) or (longitude is not None and latitude is None):
            raise serializers.ValidationError(
                "La latitude et la longitude doivent être fournies ensemble"
            )
        
        # Vérifier les plages valides
        if latitude is not None:
            if not (-90 <= float(latitude) <= 90):
                raise serializers.ValidationError("La latitude doit être entre -90 et 90")
        
        if longitude is not None:
            if not (-180 <= float(longitude) <= 180):
                raise serializers.ValidationError("La longitude doit être entre -180 et 180")
        
        return data
    
    def create(self, validated_data):
        logger.info(f"Création d'un nouveau client : {validated_data.get('nom_point_vente')}")
        
        # Hasher le mot de passe
        mot_de_passe = validated_data.pop('mot_de_passe')
        validated_data['mot_de_passe'] = make_password(mot_de_passe)
        
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
    
    def validate_email(self, value):
        """Vérifier que l'email est unique (sauf pour le client actuel)"""
        instance = self.instance
        if Client.objects.filter(email=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Un client avec cet email existe déjà")
        return value
    
    def validate_telephone(self, value):
        """Vérifier que le téléphone est unique (sauf pour le client actuel)"""
        instance = self.instance
        if Client.objects.filter(telephone=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Un client avec ce numéro de téléphone existe déjà")
        return value
    
    def validate(self, data):
        """Validations supplémentaires"""
        # Vérifier que les coordonnées GPS sont cohérentes
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # Si l'une est fournie, l'autre doit l'être aussi
        if (latitude is not None and longitude is None) or (longitude is not None and latitude is None):
            raise serializers.ValidationError(
                "La latitude et la longitude doivent être fournies ensemble"
            )
        
        # Vérifier les plages valides
        if latitude is not None:
            if not (-90 <= float(latitude) <= 90):
                raise serializers.ValidationError("La latitude doit être entre -90 et 90")
        
        if longitude is not None:
            if not (-180 <= float(longitude) <= 180):
                raise serializers.ValidationError("La longitude doit être entre -180 et 180")
        
        return data
    
    def update(self, instance, validated_data):
        logger.info(f"Mise à jour du client : {instance.code_client}")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        logger.info(f"Client mis à jour avec succès : {instance.code_client}")
        return instance


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