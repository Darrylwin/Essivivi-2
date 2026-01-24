from datetime import timedelta
from django.utils import timezone
import random
import string
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Admin, Agent, Client, PendingUser
from .serializers import (
    AdminLoginSerializer, AdminSerializer, ClientRegisterSerializer, OTPRequestSerializer,
    OTPVerifySerializer, AgentProfileSerializer, ClientProfileSerializer,
    ChangePasswordSerializer, ResendOTPSerializer, UpdatePhotoSerializer, 
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
        operation_description="Mettre à jour la photo de profil",
        manual_parameters=[
            openapi.Parameter(
                'photo',
                openapi.IN_FORM,
                description="Fichier image à uploader",
                type=openapi.TYPE_FILE,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Photo mise à jour avec succès",
                examples={
                    "application/json": {
                        "message": "Photo mise à jour avec succès",
                        "photo_url": "http://example.com/media/agents/photos/photo.jpg"
                    }
                }
            ),
            400: "Format d'image invalide ou erreur d'upload"
        },
        consumes=['multipart/form-data']  # Important pour Swagger
    )
    def put(self, request):
        logger.info(f"Tentative de mise à jour de photo pour : {request.user.email}")
        
        # Récupérer le fichier depuis request.FILES (pas request.data)
        if 'photo' not in request.FILES:
            logger.warning("Aucun fichier photo dans la requête")
            return Response(
                {"error": "Veuillez fournir une photo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photo = request.FILES['photo']
        email = request.user.email
        
        # Valider le type de fichier
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        if photo.content_type not in allowed_types:
            logger.warning(f"Type de fichier non autorisé : {photo.content_type}")
            return Response(
                {"error": "Format d'image non supporté. Utilisez JPEG ou PNG."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Limiter la taille (max 5MB)
        if photo.size > 5 * 1024 * 1024:
            logger.warning(f"Fichier trop volumineux : {photo.size} bytes")
            return Response(
                {"error": "L'image ne doit pas dépasser 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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