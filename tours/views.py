from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Tournee
from authentication.models import Agent
from .serializers import (
    TourneeSerializer, TourneeDetailSerializer,
    TourneeStartSerializer, TourneeEndSerializer
)
from .permissions import IsAgent, IsAgentOrAdmin
from users.permissions import IsAdmin

logger = logging.getLogger('tours')


# ==================== TOURNÉES ====================

class TourneeStartView(APIView):
    """Démarrer une tournée (Agent uniquement)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        request_body=TourneeStartSerializer,
        responses={
            201: TourneeDetailSerializer(),
            400: "Agent déjà en tournée ou agent inactif"
        }
    )
    def post(self, request):
        logger.info(f"Demande de démarrage de tournée pour {request.user.email}")
        
        # Récupérer l'agent
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier que l'agent est actif
        if agent.statut == 'inactif':
            logger.warning(f"Tentative de démarrage par agent inactif : {agent.numero_identification}")
            return Response(
                {"error": "Votre compte est inactif"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier qu'il n'a pas déjà une tournée en cours
        tournee_en_cours = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        if tournee_en_cours:
            logger.warning(f"Agent {agent.numero_identification} a déjà une tournée en cours")
            return Response(
                {"error": "Vous avez déjà une tournée en cours"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la tournée
        tournee = Tournee.objects.create(
            agent=agent,
            heure_debut=timezone.now()
        )
        
        # Changer le statut de l'agent
        agent.statut = 'en_tournee'
        agent.save()
        
        logger.info(f"Tournée démarrée pour l'agent {agent.numero_identification}")
        
        return Response(
            TourneeDetailSerializer(tournee).data,
            status=status.HTTP_201_CREATED
        )


class TourneeEndView(APIView):
    """Terminer une tournée (Agent uniquement)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        request_body=TourneeEndSerializer,
        responses={
            200: TourneeDetailSerializer(),
            404: "Aucune tournée en cours"
        }
    )
    def post(self, request):
        logger.info(f"Demande de fin de tournée pour {request.user.email}")
        
        # Récupérer l'agent
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer la tournée en cours
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        if not tournee:
            logger.warning(f"Aucune tournée en cours pour l'agent {agent.numero_identification}")
            return Response(
                {"error": "Aucune tournée en cours"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Terminer la tournée
        tournee.heure_fin = timezone.now()
        tournee.calculer_duree()
        
        # Changer le statut de l'agent
        agent.statut = 'actif'
        agent.save()
        
        logger.info(f"Tournée terminée pour l'agent {agent.numero_identification} - Durée: {tournee.duree_formatee}")
        
        return Response(
            TourneeDetailSerializer(tournee).data,
            status=status.HTTP_200_OK
        )


class TourneeListView(APIView):
    """Lister les tournées"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('agent_id', openapi.IN_QUERY, description="Filtrer par agent", type=openapi.TYPE_INTEGER),
            openapi.Parameter('date', openapi.IN_QUERY, description="Filtrer par date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
        ],
        responses={200: TourneeSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des tournées")
        
        # Si c'est un agent, afficher seulement ses tournées
        try:
            agent = Agent.objects.get(email=request.user.email)
            tournees = Tournee.objects.filter(agent=agent).order_by('-heure_debut')
            logger.info(f"Filtre agent appliqué : {agent.numero_identification}")
        except Agent.DoesNotExist:
            # C'est un admin, afficher toutes les tournées
            tournees = Tournee.objects.all().order_by('-heure_debut')
            
            # Filtrer par agent si demandé
            agent_id = request.query_params.get('agent_id', None)
            if agent_id:
                tournees = tournees.filter(agent_id=agent_id)
                logger.info(f"Filtre agent_id appliqué : {agent_id}")
        
        # Filtrer par date si demandé
        date = request.query_params.get('date', None)
        if date:
            tournees = tournees.filter(heure_debut__date=date)
            logger.info(f"Filtre date appliqué : {date}")
        
        serializer = TourneeSerializer(tournees, many=True)
        logger.info(f"{tournees.count()} tournées récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class TourneeDetailView(APIView):
    """Récupérer les détails d'une tournée"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(responses={200: TourneeDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de la tournée ID {pk}")
        tournee = get_object_or_404(Tournee, pk=pk)
        
        # Vérifier que l'agent ne consulte que ses propres tournées
        try:
            agent = Agent.objects.get(email=request.user.email)
            if tournee.agent != agent:
                logger.warning(f"Agent {agent.numero_identification} tente d'accéder à une tournée d'un autre agent")
                return Response(
                    {"error": "Vous ne pouvez consulter que vos propres tournées"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Agent.DoesNotExist:
            # C'est un admin, pas de restriction
            pass
        
        serializer = TourneeDetailSerializer(tournee)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TourneeCurrentView(APIView):
    """Récupérer la tournée en cours de l'agent"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        responses={
            200: TourneeDetailSerializer(),
            404: "Aucune tournée en cours"
        }
    )
    def get(self, request):
        logger.info(f"Récupération de la tournée en cours pour {request.user.email}")
        
        # Récupérer l'agent
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer la tournée en cours
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        if not tournee:
            return Response(
                {"error": "Aucune tournée en cours"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TourneeDetailSerializer(tournee)
        return Response(serializer.data, status=status.HTTP_200_OK)