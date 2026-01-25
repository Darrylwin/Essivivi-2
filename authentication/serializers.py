from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import Admin, Agent, Client, OTP, PendingUser


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
    # Ce serializer n'est plus utilisé car on utilise request.FILES directement
    # Mais on le garde pour la documentation
    photo = serializers.ImageField()


class MobileLoginSerializer(serializers.Serializer):
    """Serializer pour la connexion mobile (Agent OU Client)"""
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True)


class ClientRegisterSerializer(serializers.Serializer):
    """Serializer pour l'inscription d'un client"""
    nom_point_vente = serializers.CharField(max_length=200)
    nom_responsable = serializers.CharField(max_length=100)
    telephone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True, min_length=6)
    adresse = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    type_client = serializers.ChoiceField(choices=['detaillant', 'grossiste', 'institution'])
    
    def validate_email(self, value):
        """Vérifier que l'email n'existe pas déjà"""
        if Client.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un client avec cet email existe déjà")
        if PendingUser.objects.filter(email=value, user_type='client').exists():
            raise serializers.ValidationError("Une inscription est déjà en attente pour cet email")
        return value
    
    def validate_telephone(self, value):
        """Vérifier que le téléphone n'existe pas déjà"""
        if Client.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Un client avec ce numéro de téléphone existe déjà")
        return value
    
    def create(self, validated_data):
        """Créer un client après validation OTP"""
        return Client(**validated_data)

class ResendOTPSerializer(serializers.Serializer):
    """Serializer pour renvoyer un OTP"""
    email = serializers.EmailField()

# Ajoute cette classe dans serializers.py
class AccountInfoSerializer(serializers.Serializer):
    """Serializer pour les informations du compte"""
    user_type = serializers.CharField()
    account_info = serializers.DictField()