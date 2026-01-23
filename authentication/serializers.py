from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import Admin, Agent, Client, OTP


class AdminLoginSerializer(serializers.Serializer):
    """Serializer pour la connexion admin"""
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True)


class AdminSerializer(serializers.ModelSerializer):
    """Serializer pour les informations admin"""
    
    class Meta:
        model = Admin
        fields = ['id', 'nom', 'prenom', 'email', 'statut', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OTPRequestSerializer(serializers.Serializer):
    """Serializer pour demander un OTP"""
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    """Serializer pour vérifier un OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class AgentProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil agent"""
    tricycle_plaque = serializers.CharField(source='tricycle.plaque_immatriculation', read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'numero_identification', 'nom', 'prenom', 'telephone', 
            'email', 'date_naissance', 'adresse', 'photo', 'tricycle_plaque',
            'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'numero_identification', 'created_at', 'updated_at', 'statut']


class ClientProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil client"""
    
    class Meta:
        model = Client
        fields = [
            'id', 'code_client', 'nom_point_vente', 'nom_responsable', 
            'telephone', 'email', 'adresse', 'latitude', 'longitude',
            'type_client', 'photo_point_vente', 'statut', 'date_inscription',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code_client', 'date_inscription', 'created_at', 'updated_at', 'statut']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    ancien_mot_de_passe = serializers.CharField(write_only=True)
    nouveau_mot_de_passe = serializers.CharField(write_only=True, min_length=6)


class UpdatePhotoSerializer(serializers.Serializer):
    """Serializer pour mettre à jour la photo de profil"""
    photo = serializers.ImageField()