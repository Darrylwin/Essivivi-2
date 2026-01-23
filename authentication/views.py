from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Admin, Agent, Client
from .serializers import (
    AdminLoginSerializer, AdminSerializer, OTPRequestSerializer,
    OTPVerifySerializer, AgentProfileSerializer, ClientProfileSerializer,
    ChangePasswordSerializer, UpdatePhotoSerializer
)
from .utils import create_otp, send_otp_email, verify_otp

# Créer le logger
logger = logging.getLogger('authentication')


class AdminLoginView(APIView):
    """Connexion pour les administrateurs"""
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


class OTPRequestView(APIView):
    """Demander un code OTP pour agent ou client"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        request_body=OTPRequestSerializer,
        responses={
            200: "OTP envoyé avec succès",
            404: "Utilisateur non trouvé"
        }
    )
    def post(self, request):
        logger.info("Demande d'OTP reçue")
        
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        logger.info(f"Demande d'OTP pour l'email : {email}")
        
        # Chercher l'utilisateur (agent ou client)
        user = None
        user_type = None
        
        try:
            user = Agent.objects.get(email=email)
            user_type = 'agent'
            logger.info(f"Agent trouvé : {user.numero_identification}")
        except Agent.DoesNotExist:
            try:
                user = Client.objects.get(email=email)
                user_type = 'client'
                logger.info(f"Client trouvé : {user.code_client}")
            except Client.DoesNotExist:
                logger.warning(f"Aucun utilisateur trouvé pour l'email : {email}")
                return Response(
                    {"error": "Aucun utilisateur trouvé avec cet email"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Générer et envoyer l'OTP
        otp_code = create_otp(email, user_type)
        logger.info(f"OTP généré pour {email} ({user_type}) : {otp_code}")
        
        # En développement, on retourne l'OTP dans la réponse
        # En production, on l'envoie uniquement par email
        email_sent = send_otp_email(email, otp_code)
        
        if email_sent:
            logger.info(f"OTP envoyé par email à {email}")
        else:
            logger.error(f"Échec de l'envoi de l'OTP par email à {email}")
        
        return Response({
            "message": "Code OTP envoyé par email",
            "email": email,
            # À SUPPRIMER EN PRODUCTION
            "otp": otp_code  # Pour faciliter les tests
        }, status=status.HTTP_200_OK)


class OTPVerifyView(APIView):
    """Vérifier un code OTP et créer une session"""
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
        
        # Vérifier l'OTP
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
        
        # Créer un admin temporaire pour générer le token
        admin = Admin.objects.filter(email=email).first()
        if not admin:
            # Créer un admin temporaire pour ce user
            admin = Admin.objects.create(
                email=email,
                nom=user.nom if user_type == 'agent' else user.nom_responsable,
                prenom=user.prenom if user_type == 'agent' else '',
                statut='actif'
            )
            logger.info(f"Admin temporaire créé pour {email}")
        
        refresh = RefreshToken.for_user(admin)
        
        logger.info(f"Authentification OTP réussie pour {email}")
        
        return Response({
            "message": "Authentification réussie",
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user_type": user_type,
            "user": user_data
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """Voir le profil de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "Profil récupéré avec succès"
        }
    )
    def get(self, request):
        logger.info(f"Demande de profil pour l'utilisateur : {request.user.email}")
        
        # Récupérer l'email de l'utilisateur connecté
        email = request.user.email
        
        # Chercher dans agents puis clients
        try:
            agent = Agent.objects.get(email=email)
            logger.info(f"Profil agent récupéré : {agent.numero_identification}")
            return Response({
                "user_type": "agent",
                "profile": AgentProfileSerializer(agent).data
            }, status=status.HTTP_200_OK)
        except Agent.DoesNotExist:
            pass
        
        try:
            client = Client.objects.get(email=email)
            logger.info(f"Profil client récupéré : {client.code_client}")
            return Response({
                "user_type": "client",
                "profile": ClientProfileSerializer(client).data
            }, status=status.HTTP_200_OK)
        except Client.DoesNotExist:
            pass
        
        # Si c'est un admin
        logger.info(f"Profil admin récupéré : {request.user.email}")
        return Response({
            "user_type": "admin",
            "profile": AdminSerializer(request.user).data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """Changer le mot de passe"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=ChangePasswordSerializer,
        responses={
            200: "Mot de passe modifié avec succès",
            400: "Ancien mot de passe incorrect"
        }
    )
    def put(self, request):
        logger.info(f"Tentative de changement de mot de passe pour : {request.user.email}")
        
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ancien_mot_de_passe = serializer.validated_data['ancien_mot_de_passe']
        nouveau_mot_de_passe = serializer.validated_data['nouveau_mot_de_passe']
        
        # Vérifier l'ancien mot de passe
        if not request.user.check_password(ancien_mot_de_passe):
            logger.warning(f"Échec de changement de mot de passe : ancien mot de passe incorrect pour {request.user.email}")
            return Response(
                {"error": "Ancien mot de passe incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mettre à jour le mot de passe
        request.user.set_password(nouveau_mot_de_passe)
        request.user.save()
        
        logger.info(f"Mot de passe modifié avec succès pour : {request.user.email}")
        
        return Response({
            "message": "Mot de passe modifié avec succès"
        }, status=status.HTTP_200_OK)


class UpdatePhotoView(APIView):
    """Mettre à jour la photo de profil"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=UpdatePhotoSerializer,
        responses={
            200: "Photo mise à jour avec succès",
            400: "Format d'image invalide"
        }
    )
    def put(self, request):
        logger.info(f"Tentative de mise à jour de photo pour : {request.user.email}")
        
        serializer = UpdatePhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        photo = serializer.validated_data['photo']
        email = request.user.email
        
        # Chercher l'utilisateur et mettre à jour sa photo
        try:
            agent = Agent.objects.get(email=email)
            agent.photo = photo
            agent.save()
            logger.info(f"Photo mise à jour avec succès pour l'agent : {agent.numero_identification}")
            return Response({
                "message": "Photo mise à jour avec succès",
                "photo_url": agent.photo.url if agent.photo else None
            }, status=status.HTTP_200_OK)
        except Agent.DoesNotExist:
            pass
        
        try:
            client = Client.objects.get(email=email)
            client.photo_point_vente = photo
            client.save()
            logger.info(f"Photo mise à jour avec succès pour le client : {client.code_client}")
            return Response({
                "message": "Photo mise à jour avec succès",
                "photo_url": client.photo_point_vente.url if client.photo_point_vente else None
            }, status=status.HTTP_200_OK)
        except Client.DoesNotExist:
            pass
        
        logger.error(f"Échec de mise à jour de photo pour : {email}")
        return Response(
            {"error": "Impossible de mettre à jour la photo"},
            status=status.HTTP_400_BAD_REQUEST
        )