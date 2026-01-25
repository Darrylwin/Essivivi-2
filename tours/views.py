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
)
from .permissions import IsAgent, IsAgentOrAdmin

logger = logging.getLogger('tours')


class TourneeStartView(APIView):
    """Démarrer une tournée (CRITIQUE pour les livraisons)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    def post(self, request):
        logger.info(f"Démarrage tournée pour {request.user.email}")
        
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response({"error": "Agent non trouvé"}, status=404)
        
        # Vérifier qu'il n'a pas déjà une tournée en cours
        if Tournee.objects.filter(agent=agent, heure_fin__isnull=True).exists():
            return Response({"error": "Vous avez déjà une tournée en cours"}, status=400)
        
        # Créer la tournée
        tournee = Tournee.objects.create(agent=agent, heure_debut=timezone.now())
        
        # Changer le statut de l'agent (CRITIQUE pour les livraisons)
        agent.statut = 'en_tournee'
        agent.save()
        
        logger.info(f"Tournée #{tournee.id} démarrée pour agent {agent.numero_identification}")
        
        return Response({
            "message": "Tournée démarrée",
            "tournee_id": tournee.id,
            "heure_debut": tournee.heure_debut
        }, status=201)


class TourneeEndView(APIView):
    """Terminer une tournée (CRITIQUE pour débloquer l'agent)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    def post(self, request):
        logger.info(f"Fin tournée pour {request.user.email}")
        
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response({"error": "Agent non trouvé"}, status=404)
        
        # Récupérer la tournée en cours
        tournee = Tournee.objects.filter(agent=agent, heure_fin__isnull=True).first()
        if not tournee:
            return Response({"error": "Aucune tournée en cours"}, status=404)
        
        # Terminer la tournée
        tournee.heure_fin = timezone.now()
        tournee.save()
        
        # Réactiver l'agent (CRITIQUE pour les futures livraisons)
        agent.statut = 'actif'
        agent.save()
        
        logger.info(f"Tournée #{tournee.id} terminée pour agent {agent.numero_identification}")
        
        return Response({
            "message": "Tournée terminée",
            "tournee_id": tournee.id,
            "heure_fin": tournee.heure_fin
        }, status=200)


class TourneeCurrentView(APIView):
    """Vérifier la tournée en cours (utile pour l'UI)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    def get(self, request):
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response({"error": "Agent non trouvé"}, status=404)
        
        tournee = Tournee.objects.filter(agent=agent, heure_fin__isnull=True).first()
        
        if tournee:
            return Response({
                "en_cours": True,
                "tournee_id": tournee.id,
                "heure_debut": tournee.heure_debut
            })
        else:
            return Response({
                "en_cours": False,
                "message": "Aucune tournée en cours"
            })
        

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

