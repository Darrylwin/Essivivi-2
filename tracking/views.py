from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import PositionAgent
from authentication.models import Agent
from .serializers import (
    PositionAgentCreateSerializer, PositionAgentSerializer,
    PositionAgentListSerializer, AgentEnTourneeSerializer,
    TempsEstimeSerializer
)
from .permissions import IsAgent, IsAgentOrAdmin
from users.permissions import IsAdmin

logger = logging.getLogger('tracking')


# ==================== TRACKING GPS ====================

class PositionCreateView(APIView):
    """Enregistrer une position GPS (Agent uniquement)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        request_body=PositionAgentCreateSerializer,
        responses={
            201: PositionAgentSerializer(),
            400: "Validation échouée"
        }
    )
    def post(self, request):
        logger.info(f"Enregistrement de position pour {request.user.email}")
        
        serializer = PositionAgentCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        position = serializer.save()
        
        return Response(
            PositionAgentSerializer(position).data,
            status=status.HTTP_201_CREATED
        )


class PositionListView(APIView):
    """Lister les positions GPS"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('agent_id', openapi.IN_QUERY, description="Filtrer par agent", type=openapi.TYPE_INTEGER),
            openapi.Parameter('date', openapi.IN_QUERY, description="Filtrer par date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('heure_debut', openapi.IN_QUERY, description="Heure de début (HH:MM:SS)", type=openapi.TYPE_STRING),
            openapi.Parameter('heure_fin', openapi.IN_QUERY, description="Heure de fin (HH:MM:SS)", type=openapi.TYPE_STRING),
        ],
        responses={200: PositionAgentListSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des positions")
        
        # Déterminer si c'est un admin ou un agent
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if is_admin:
            # Admin voit toutes les positions
            positions = PositionAgent.objects.all()
            logger.info("Accès admin : toutes les positions")
        else:
            # Agent voit seulement ses positions
            try:
                agent = Agent.objects.get(email=request.user.email)
                positions = PositionAgent.objects.filter(agent=agent)
                logger.info(f"Accès agent : positions de {agent.numero_identification}")
            except Agent.DoesNotExist:
                return Response(
                    {"error": "Agent non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        positions = positions.order_by('-timestamp')
        
        # Filtrer par agent (admin uniquement)
        agent_id = request.query_params.get('agent_id', None)
        if agent_id and is_admin:
            positions = positions.filter(agent_id=agent_id)
            logger.info(f"Filtre agent_id appliqué : {agent_id}")
        
        # Filtrer par date
        date = request.query_params.get('date', None)
        if date:
            positions = positions.filter(timestamp__date=date)
            logger.info(f"Filtre date appliqué : {date}")
        
        # Filtrer par plage horaire
        heure_debut = request.query_params.get('heure_debut', None)
        heure_fin = request.query_params.get('heure_fin', None)
        
        if heure_debut:
            positions = positions.filter(timestamp__time__gte=heure_debut)
            logger.info(f"Filtre heure_debut appliqué : {heure_debut}")
        
        if heure_fin:
            positions = positions.filter(timestamp__time__lte=heure_fin)
            logger.info(f"Filtre heure_fin appliqué : {heure_fin}")
        
        serializer = PositionAgentListSerializer(positions, many=True)
        logger.info(f"{positions.count()} positions récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class PositionDetailView(APIView):
    """Récupérer les détails d'une position"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(responses={200: PositionAgentSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de la position ID {pk}")
        position = get_object_or_404(PositionAgent, pk=pk)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            # Agent ne peut voir que ses propres positions
            try:
                agent = Agent.objects.get(email=request.user.email)
                if position.agent != agent:
                    logger.warning(
                        f"Agent {agent.numero_identification} tente d'accéder "
                        f"à une position d'un autre agent"
                    )
                    return Response(
                        {"error": "Vous ne pouvez consulter que vos propres positions"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                return Response(
                    {"error": "Agent non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = PositionAgentSerializer(position)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AgentDernierePositionView(APIView):
    """Récupérer la dernière position d'un agent"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(
        responses={
            200: PositionAgentSerializer(),
            404: "Aucune position enregistrée"
        }
    )
    def get(self, request, agent_id):
        logger.info(f"Récupération de la dernière position de l'agent ID {agent_id}")
        
        agent = get_object_or_404(Agent, pk=agent_id)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            # Agent ne peut voir que sa propre position
            try:
                user_agent = Agent.objects.get(email=request.user.email)
                if agent != user_agent:
                    return Response(
                        {"error": "Vous ne pouvez consulter que votre propre position"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                return Response(
                    {"error": "Agent non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        position = PositionAgent.get_derniere_position(agent)
        
        if not position:
            return Response(
                {"error": "Aucune position enregistrée pour cet agent"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PositionAgentSerializer(position)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AgentsEnTourneeView(APIView):
    """Récupérer tous les agents en tournée avec leur dernière position (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        responses={200: AgentEnTourneeSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération des agents en tournée")
        
        # Récupérer tous les agents en tournée
        agents = Agent.objects.filter(statut='en_tournee')
        
        serializer = AgentEnTourneeSerializer(agents, many=True)
        logger.info(f"{agents.count()} agents en tournée")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class TempsEstimeView(APIView):
    """Calculer le temps estimé d'arrivée (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        request_body=TempsEstimeSerializer,
        responses={
            200: openapi.Response(
                description="Temps estimé calculé",
                examples={
                    "application/json": {
                        "agent_id": 1,
                        "agent_numero": "AGT-123456",
                        "position_actuelle": {
                            "latitude": 5.3599517,
                            "longitude": -4.0082563
                        },
                        "destination": {
                            "latitude": 5.3650000,
                            "longitude": -4.0100000
                        },
                        "distance_metres": 876.5,
                        "distance_km": 0.88,
                        "vitesse_moyenne_kmh": 20,
                        "temps_estime_minutes": 2.6,
                        "heure_arrivee_estimee": "2025-01-23T15:32:00Z"
                    }
                }
            ),
            404: "Agent ou position non trouvée"
        }
    )
    def post(self, request):
        logger.info("Calcul du temps estimé d'arrivée")
        
        serializer = TempsEstimeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        agent_id = serializer.validated_data['agent_id']
        dest_lat = serializer.validated_data['destination_latitude']
        dest_lon = serializer.validated_data['destination_longitude']
        vitesse_moyenne = serializer.validated_data.get('vitesse_moyenne', 20)
        
        # Récupérer l'agent
        agent = Agent.objects.get(id=agent_id)
        
        # Récupérer la dernière position
        position = PositionAgent.get_derniere_position(agent)
        
        if not position:
            return Response(
                {"error": "Aucune position enregistrée pour cet agent"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculer la distance
        distance_metres = PositionAgent.calculer_distance(
            position.latitude,
            position.longitude,
            dest_lat,
            dest_lon
        )
        distance_km = distance_metres / 1000
        
        # Calculer le temps estimé
        temps_minutes = PositionAgent.calculer_temps_estime(
            position.latitude,
            position.longitude,
            dest_lat,
            dest_lon,
            vitesse_moyenne
        )
        
        # Calculer l'heure d'arrivée estimée
        heure_arrivee = timezone.now() + timedelta(minutes=temps_minutes)
        
        logger.info(
            f"Temps estimé calculé pour {agent.numero_identification} : "
            f"{temps_minutes} minutes ({distance_km:.2f} km)"
        )
        
        return Response({
            "agent_id": agent.id,
            "agent_numero": agent.numero_identification,
            "position_actuelle": {
                "latitude": float(position.latitude),
                "longitude": float(position.longitude),
                "timestamp": position.timestamp
            },
            "destination": {
                "latitude": float(dest_lat),
                "longitude": float(dest_lon)
            },
            "distance_metres": round(distance_metres, 2),
            "distance_km": round(distance_km, 2),
            "vitesse_moyenne_kmh": vitesse_moyenne,
            "temps_estime_minutes": temps_minutes,
            "heure_arrivee_estimee": heure_arrivee
        }, status=status.HTTP_200_OK)


class ParcoursAgentView(APIView):
    """Récupérer le parcours complet d'un agent pour une tournée"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('tournee_id', openapi.IN_QUERY, description="ID de la tournée", type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={200: PositionAgentListSerializer(many=True)}
    )
    def get(self, request, agent_id):
        logger.info(f"Récupération du parcours de l'agent ID {agent_id}")
        
        agent = get_object_or_404(Agent, pk=agent_id)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            try:
                user_agent = Agent.objects.get(email=request.user.email)
                if agent != user_agent:
                    return Response(
                        {"error": "Vous ne pouvez consulter que votre propre parcours"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                return Response(
                    {"error": "Agent non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Récupérer l'ID de la tournée
        tournee_id = request.query_params.get('tournee_id', None)
        
        if not tournee_id:
            return Response(
                {"error": "Le paramètre tournee_id est obligatoire"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les positions de la tournée
        positions = PositionAgent.objects.filter(
            agent=agent,
            tournee_id=tournee_id
        ).order_by('timestamp')
        
        if not positions.exists():
            return Response(
                {"error": "Aucune position trouvée pour cette tournée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PositionAgentListSerializer(positions, many=True)
        logger.info(f"{positions.count()} positions récupérées pour le parcours")
        
        # Calculer la distance totale parcourue
        distance_totale = 0
        positions_list = list(positions)
        
        for i in range(1, len(positions_list)):
            distance = PositionAgent.calculer_distance(
                positions_list[i-1].latitude,
                positions_list[i-1].longitude,
                positions_list[i].latitude,
                positions_list[i].longitude
            )
            distance_totale += distance
        
        return Response({
            "agent": {
                "id": agent.id,
                "numero": agent.numero_identification,
                "nom": f"{agent.prenom} {agent.nom}"
            },
            "tournee_id": int(tournee_id),
            "nombre_positions": positions.count(),
            "distance_totale_metres": round(distance_totale, 2),
            "distance_totale_km": round(distance_totale / 1000, 2),
            "positions": serializer.data
        }, status=status.HTTP_200_OK)