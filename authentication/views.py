from datetime import timedelta
from django.utils import timezone
import random
import string
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Admin, Agent, Client, PendingUser
from .serializers import (
    AdminLoginSerializer, AdminSerializer, ClientRegisterSerializer,
    OTPVerifySerializer, AgentProfileSerializer, ClientProfileSerializer,
    ResendOTPSerializer, 
    MobileLoginSerializer
)
from .utils import create_otp, send_otp_email, verify_otp

# Créer le logger
logger = logging.getLogger('authentication')


class AdminLoginView(APIView):
    """Connexion pour les administrateurs (Web uniquement)"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        request_body=AdminLoginSerializer,
        responses={
            200: openapi.Response(
                description="Connexion réussie",
                examples={
                    "application/json": {
                        "message": "Connexion réussie",
                        "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                        "admin": {
                            "id": 1,
                            "nom": "Doe",
                            "prenom": "John",
                            "email": "admin@essivivi.com"
                        }
                    }
                }
            ),
            400: "Email ou mot de passe incorrect",
            403: "Compte inactif"
        }
    )
    def post(self, request):
        logger.info("Tentative de connexion admin")
        
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        mot_de_passe = serializer.validated_data['mot_de_passe']
        
        logger.info(f"Tentative de connexion pour l'email : {email}")
        
        try:
            admin = Admin.objects.get(email=email)
            logger.info(f"Admin trouvé : {admin.email}")
        except Admin.DoesNotExist:
            logger.warning(f"Échec de connexion : Admin non trouvé pour l'email {email}")
            return Response(
                {"error": "Email ou mot de passe incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier le mot de passe
        if not admin.check_password(mot_de_passe):
            logger.warning(f"Échec de connexion : Mot de passe incorrect pour {email}")
            return Response(
                {"error": "Email ou mot de passe incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que le compte est actif
        if admin.statut != 'actif':
            logger.warning(f"Échec de connexion : Compte inactif pour {email}")
            return Response(
                {"error": "Votre compte est inactif"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(admin)
        
        logger.info(f"Connexion réussie pour l'admin : {admin.email}")
        
        return Response({
            "message": "Connexion réussie",
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "admin": AdminSerializer(admin).data
        }, status=status.HTTP_200_OK)


class MobileLoginView(APIView):
    """
    Connexion mobile UNIQUE pour Agent ET Client
    Email + Password → Vérification → Envoi OTP → Validation OTP
    """
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        request_body=MobileLoginSerializer,
        responses={
            200: openapi.Response(
                description="Login réussi, OTP envoyé",
                examples={
                    "application/json": {
                        "message": "Code OTP envoyé à votre email",
                        "email": "user@example.com",
                        "user_type": "agent",  # ou "client"
                        "requires_otp": True,
                        "otp": "123456"  # À supprimer en production
                    }
                }
            ),
            400: "Email ou mot de passe incorrect",
            403: "Compte inactif"
        }
    )
    def post(self, request):
        logger.info("Tentative de connexion mobile")
        
        serializer = MobileLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        mot_de_passe = serializer.validated_data['mot_de_passe']
        
        logger.info(f"Connexion mobile pour : {email}")
        
        # ÉTAPE 1 : Détecter le type d'utilisateur
        user = None
        user_type = None
        
        # Chercher d'abord dans Agent
        try:
            user = Agent.objects.get(email=email)
            user_type = 'agent'
            logger.info(f"Utilisateur détecté : Agent {user.numero_identification}")
        except Agent.DoesNotExist:
            # Sinon chercher dans Client
            try:
                user = Client.objects.get(email=email)
                user_type = 'client'
                logger.info(f"Utilisateur détecté : Client {user.code_client}")
            except Client.DoesNotExist:
                logger.warning(f"Aucun utilisateur trouvé pour {email}")
                return Response(
                    {"error": "Email ou mot de passe incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # ÉTAPE 2 : Vérifier le statut
        if user.statut == 'inactif':
            logger.warning(f"Compte inactif : {email}")
            return Response(
                {"error": "Votre compte est inactif. Contactez l'administrateur."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # ÉTAPE 3 : Vérifier le mot de passe
        if not user.check_password(mot_de_passe):
            logger.warning(f"Mot de passe incorrect pour {user_type} {email}")
            return Response(
                {"error": "Email ou mot de passe incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ÉTAPE 4 : Générer et envoyer l'OTP
        otp_code = create_otp(email, user_type)
        email_sent = send_otp_email(email, otp_code)
        
        if email_sent:
            logger.info(f"OTP envoyé avec succès à {email}")
        else:
            logger.error(f"Échec de l'envoi de l'OTP à {email}")
        
        logger.info(f"OTP généré pour {user_type} {email} : {otp_code}")
        
        return Response({
            "message": "Code OTP envoyé à votre email",
            "email": email,
            "user_type": user_type,
            "requires_otp": True,
            # À SUPPRIMER EN PRODUCTION
            "otp": otp_code
        }, status=status.HTTP_200_OK)


class OTPVerifyView(APIView):
    """Vérifier un code OTP pour login OU inscription"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        request_body=OTPVerifySerializer,
        responses={
            200: openapi.Response(
                description="Authentification réussie",
                examples={
                    "application/json": {
                        "message": "Authentification réussie",
                        "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                        "user_type": "agent",
                        "user": {}
                    }
                }
            ),
            400: "OTP invalide ou expiré"
        }
    )
    def post(self, request):
        logger.info("Tentative de vérification OTP")
        
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        logger.info(f"Vérification OTP pour l'email : {email}")
        
        # ÉTAPE 1: Vérifier si c'est pour une inscription (PendingUser)
        try:
            pending_user = PendingUser.objects.get(email=email, user_type='client')
            
            # Vérifier l'OTP pour l'inscription
            if pending_user.otp_code != otp:
                logger.warning(f"OTP invalide pour inscription {email}")
                return Response(
                    {"error": "Code OTP invalide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not pending_user.is_otp_valid():
                logger.warning(f"OTP expiré pour inscription {email}")
                return Response(
                    {"error": "Code OTP expiré. Demandez un nouveau code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Créer le client
            data = pending_user.data
            
            try:
                client = Client.objects.create(
                    nom_point_vente=data['nom_point_vente'],
                    nom_responsable=data['nom_responsable'],
                    telephone=data['telephone'],
                    email=data['email'],
                    mot_de_passe=data['mot_de_passe'],
                    adresse=data['adresse'],
                    latitude=data.get('latitude'),
                    longitude=data.get('longitude'),
                    type_client=data['type_client'],
                    statut='actif'
                )
                
                # Créer un admin temporaire pour le JWT
                admin = Admin.objects.create(
                    email=email,
                    nom=data['nom_responsable'],
                    prenom='',
                    statut='actif'
                )
                
                # Supprimer l'utilisateur en attente
                pending_user.delete()
                
                # Générer le token
                refresh = RefreshToken.for_user(admin)
                
                logger.info(f"Compte client activé avec succès : {client.code_client}")
                
                return Response({
                    "message": "Compte activé avec succès",
                    "token": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_type": "client",
                    "user": ClientProfileSerializer(client).data
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Erreur lors de la création du client : {str(e)}")
                return Response(
                    {"error": f"Erreur lors de la création du compte : {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except PendingUser.DoesNotExist:
            # ÉTAPE 2: Si pas d'inscription, c'est pour un login
            pass
        
        # ÉTAPE 3: Vérifier l'OTP pour login (Agent ou Client existant)
        is_valid, user_type_or_error = verify_otp(email, otp)
        
        if not is_valid:
            logger.warning(f"Échec de vérification OTP pour {email} : {user_type_or_error}")
            return Response(
                {"error": user_type_or_error},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_type = user_type_or_error
        logger.info(f"OTP valide pour {email} (type: {user_type})")
        
        # Récupérer l'utilisateur
        if user_type == 'agent':
            user = Agent.objects.get(email=email)
            user_data = AgentProfileSerializer(user).data
            logger.info(f"Agent authentifié : {user.numero_identification}")
        else:
            user = Client.objects.get(email=email)
            user_data = ClientProfileSerializer(user).data
            logger.info(f"Client authentifié : {user.code_client}")
        
        # Vérifier que le compte est toujours actif
        if user.statut == 'inactif':
            logger.warning(f"Compte {user_type} inactif : {email}")
            return Response(
                {"error": "Votre compte est inactif. Contactez l'administrateur."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Créer un admin temporaire pour générer le token JWT
        admin = Admin.objects.filter(email=email).first()
        if not admin:
            if user_type == 'agent':
                admin = Admin.objects.create(
                    email=email,
                    nom=user.nom,
                    prenom=user.prenom,
                    statut='actif'
                )
            else:  # client
                admin = Admin.objects.create(
                    email=email,
                    nom=user.nom_responsable,
                    prenom='',
                    statut='actif'
                )
            logger.info(f"Admin temporaire créé pour {email}")
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(admin)
        
        logger.info(f"Authentification OTP réussie pour {email} (type: {user_type})")
        
        return Response({
            "message": "Authentification réussie",
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user_type": user_type,
            "user": user_data
        }, status=status.HTTP_200_OK)
class ClientRegisterView(APIView):
    """Inscription d'un nouveau client avec OTP"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        request_body=ClientRegisterSerializer,
        responses={
            201: openapi.Response(
                description="Inscription réussie, OTP envoyé",
                examples={
                    "application/json": {
                        "message": "Inscription réussie. Un code OTP a été envoyé à votre email.",
                        "email": "client@example.com",
                        "otp": "123456"  # À supprimer en production
                    }
                }
            ),
            400: "Validation échouée"
        }
    )
    def post(self, request):
        logger.info("Demande d'inscription client")
        
        serializer = ClientRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Vérifier si l'email existe déjà (compte actif)
        if Client.objects.filter(email=email).exists():
            logger.warning(f"Email déjà utilisé : {email}")
            return Response(
                {"error": "Un compte avec cet email existe déjà"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Générer un OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        otp_expires_at = timezone.now() + timedelta(minutes=10)
        
        # Stocker les données temporairement
        # Convertir les Decimal en float pour JSONField
        def convert_decimals(obj):
            if isinstance(obj, dict):
                return {k: convert_decimals(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_decimals(v) for v in obj]
            elif hasattr(obj, 'is_finite') and hasattr(obj, 'as_tuple'):
                # C'est un Decimal
                return float(obj)
            return obj

        validated_data_json = convert_decimals(serializer.validated_data)
        pending_user, created = PendingUser.objects.update_or_create(
            email=email,
            user_type='client',
            defaults={
                'data': validated_data_json,
                'otp_code': otp_code,
                'otp_expires_at': otp_expires_at
            }
        )
        
        # Envoyer l'OTP par email
        email_sent = send_otp_email(email, otp_code)
        
        if email_sent:
            logger.info(f"OTP envoyé à {email} pour inscription client")
        else:
            logger.error(f"Échec de l'envoi de l'OTP à {email}")
        
        logger.info(f"Inscription client en attente pour {email}")
        
        return Response({
            "message": "Inscription réussie. Un code OTP a été envoyé à votre email.",
            "email": email,
            "expires_in_minutes": 10,
            # À SUPPRIMER EN PRODUCTION
            "otp": otp_code  # Pour faciliter les tests
        }, status=status.HTTP_201_CREATED)

class ResendOTPView(APIView):
    """Renvoyer un OTP pour inscription client"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        request_body=ResendOTPSerializer,
        responses={
            200: "OTP renvoyé avec succès",
            404: "Aucune inscription en attente"
        }
    )
    def post(self, request):
        logger.info("Demande de renvoi d'OTP pour inscription")
        
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Vérifier s'il y a une inscription en attente
        try:
            pending_user = PendingUser.objects.get(email=email, user_type='client')
        except PendingUser.DoesNotExist:
            logger.warning(f"Aucune inscription en attente pour {email}")
            return Response(
                {"error": "Aucune inscription en attente pour cet email"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Générer un nouveau OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        pending_user.otp_code = otp_code
        pending_user.otp_expires_at = timezone.now() + timedelta(minutes=10)
        pending_user.save()
        
        # Envoyer l'OTP
        email_sent = send_otp_email(email, otp_code)
        
        if email_sent:
            logger.info(f"Nouvel OTP envoyé à {email}")
        else:
            logger.error(f"Échec de l'envoi de l'OTP à {email}")
        
        return Response({
            "message": "Un nouveau code OTP a été envoyé à votre email",
            "email": email,
            "expires_in_minutes": 10,
            # À SUPPRIMER EN PRODUCTION
            "otp": otp_code
        }, status=status.HTTP_200_OK)

class AccountInfoView(APIView):
    """Récupérer les informations du compte de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Récupérer les informations détaillées du compte",
        responses={
            200: openapi.Response(
                description="Informations du compte récupérées avec succès",
                examples={
                    "application/json": {
                        "user_type": "agent",
                        "account_info": {
                            "id": 1,
                            "email": "agent@example.com",
                            "nom": "Doe",
                            "prenom": "John",
                            "numero_identification": "AGT-123456",
                            "telephone": "+1234567890",
                            "statut": "actif",
                            "date_inscription": "2024-01-15T10:30:00Z",
                            "photo_url": "https://api.example.com/media/agents/photos/profil.jpg"
                        }
                    }
                }
            ),
            404: "Utilisateur non trouvé"
        }
    )
    def get(self, request):
        logger.info(f"Demande d'informations du compte pour : {request.user.email}")
        
        email = request.user.email
        
        # Chercher d'abord dans les agents
        try:
            agent = Agent.objects.get(email=email)
            account_info = {
                "id": agent.id,
                "email": agent.email,
                "nom": agent.nom,
                "prenom": agent.prenom,
                "numero_identification": agent.numero_identification,
                "telephone": agent.telephone,
                "statut": agent.statut,
                "date_naissance": agent.date_naissance,
                "adresse": agent.adresse,
                "date_inscription": agent.created_at,
                "photo_url": self._get_full_photo_url(request, agent.photo) if agent.photo else None,
                "tricycle": agent.tricycle.plaque_immatriculation if agent.tricycle else None
            }
            user_type = "agent"
            logger.info(f"Informations du compte agent récupérées : {agent.numero_identification}")
            
        except Agent.DoesNotExist:
            # Chercher dans les clients
            try:
                client = Client.objects.get(email=email)
                account_info = {
                    "id": client.id,
                    "email": client.email,
                    "nom_point_vente": client.nom_point_vente,
                    "nom_responsable": client.nom_responsable,
                    "telephone": client.telephone,
                    "code_client": client.code_client,
                    "statut": client.statut,
                    "adresse": client.adresse,
                    "latitude": float(client.latitude) if client.latitude else None,
                    "longitude": float(client.longitude) if client.longitude else None,
                    "type_client": client.type_client,
                    "date_inscription": client.date_inscription,
                    "photo_url": self._get_full_photo_url(request, client.photo_point_vente) if client.photo_point_vente else None
                }
                user_type = "client"
                logger.info(f"Informations du compte client récupérées : {client.code_client}")
                
            except Client.DoesNotExist:
                # Chercher dans les admins
                try:
                    admin = Admin.objects.get(email=email)
                    account_info = {
                        "id": admin.id,
                        "email": admin.email,
                        "nom": admin.nom,
                        "prenom": admin.prenom,
                        "statut": admin.statut,
                        "date_inscription": admin.created_at,
                        "photo_url": None  # Les admins n'ont pas de photo
                    }
                    user_type = "admin"
                    logger.info(f"Informations du compte admin récupérées : {admin.email}")
                    
                except Admin.DoesNotExist:
                    logger.error(f"Utilisateur non trouvé pour l'email : {email}")
                    return Response(
                        {"error": "Utilisateur non trouvé"},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        return Response({
            "user_type": user_type,
            "account_info": account_info
        }, status=status.HTTP_200_OK)
    
    def _get_full_photo_url(self, request, photo_field):
        """Retourne l'URL complète d'une photo"""
        if not photo_field:
            return None
        
        # Construire l'URL complète
        return request.build_absolute_uri(photo_field.url)
    
