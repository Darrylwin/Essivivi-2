from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from authentication.models import Agent, Client, Tricycle
from .serializers import (
    AgentCreateSerializer, AgentUpdateSerializer, AgentListSerializer,
    AgentDetailSerializer,
    ClientCreateSerializer, ClientUpdateSerializer, ClientListSerializer,
    ClientDetailSerializer,
    TricycleSerializer
)
from .permissions import IsAdmin

logger = logging.getLogger('users')


# ==================== TRICYCLES ====================

class TricycleViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tricycles
    
    list: Liste tous les tricycles
    create: Crée un nouveau tricycle
    retrieve: Récupère un tricycle spécifique
    update: Modifie un tricycle
    destroy: Supprime un tricycle
    """
    queryset = Tricycle.objects.all()
    serializer_class = TricycleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def perform_create(self, serializer):
        tricycle = serializer.save()
        logger.info(f"Tricycle créé : {tricycle.plaque_immatriculation}")
    
    def perform_update(self, serializer):
        tricycle = serializer.save()
        logger.info(f"Tricycle mis à jour : {tricycle.plaque_immatriculation}")
    
    def perform_destroy(self, instance):
        plaque = instance.plaque_immatriculation
        instance.delete()
        logger.info(f"Tricycle supprimé : {plaque}")


# ==================== AGENTS ====================

class AgentListCreateView(APIView):
    """
    GET: Liste tous les agents avec filtres optionnels
    POST: Crée un nouvel agent
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Liste tous les agents avec filtres optionnels",
        manual_parameters=[
            openapi.Parameter(
                'statut',
                openapi.IN_QUERY,
                description="Filtrer par statut (actif, inactif, en tournée)",
                type=openapi.TYPE_STRING,
                enum=['actif', 'inactif', 'en tournée']
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Rechercher par nom, prénom, email ou numéro d'identification",
                type=openapi.TYPE_STRING
            ),
        ],
        responses={200: AgentListSerializer(many=True)}
    )
    def get(self, request):
        """Liste tous les agents"""
        logger.info("Récupération de la liste des agents")
        
        agents = Agent.objects.all().select_related('tricycle').order_by('-created_at')
        
        # Filtre par statut
        statut = request.query_params.get('statut')
        if statut:
            agents = agents.filter(statut=statut)
            logger.info(f"Filtre statut appliqué : {statut}")
        
        # Recherche
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            agents = agents.filter(
                Q(nom__icontains=search) |
                Q(prenom__icontains=search) |
                Q(email__icontains=search) |
                Q(numero_identification__icontains=search) |
                Q(telephone__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = AgentListSerializer(agents, many=True)
        logger.info(f"{agents.count()} agents trouvés")
        
        return Response({
            'count': agents.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Crée un nouvel agent. Si mot_de_passe n'est pas fourni, il sera généré automatiquement.",
        request_body=AgentCreateSerializer,
        responses={
            201: openapi.Response(
                description="Agent créé avec succès",
                examples={
                    "application/json": {
                        "message": "Agent créé avec succès",
                        "agent": {
                            "id": 1,
                            "numero_identification": "AGT-000001",
                            "nom": "Doe",
                            "prenom": "John",
                            "email": "john@example.com"
                        },
                        "mot_de_passe_genere": "Abc123XyZ456"
                    }
                }
            )
        }
    )
    def post(self, request):
        """Crée un nouvel agent"""
        logger.info("Création d'un nouvel agent")
        
        serializer = AgentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        agent = serializer.save()
        
        response_data = {
            'message': 'Agent créé avec succès',
            'agent': AgentDetailSerializer(agent).data
        }
        
        # Ajouter le mot de passe généré s'il existe
        if hasattr(agent, '_mot_de_passe_genere'):
            response_data['mot_de_passe_genere'] = agent._mot_de_passe_genere
            response_data['message'] = 'Agent créé avec succès. Conservez le mot de passe généré en lieu sûr.'
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class AgentDetailView(APIView):
    """
    GET: Récupère un agent spécifique
    PUT/PATCH: Modifie un agent
    DELETE: Supprime un agent
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Récupère les détails d'un agent",
        responses={200: AgentDetailSerializer()}
    )
    def get(self, request, pk):
        """Récupère un agent"""
        logger.info(f"Récupération agent ID {pk}")
        agent = get_object_or_404(Agent.objects.select_related('tricycle'), pk=pk)
        serializer = AgentDetailSerializer(agent)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie un agent (tous les champs sont optionnels)",
        request_body=AgentUpdateSerializer,
        responses={200: AgentDetailSerializer()}
    )
    def put(self, request, pk):
        """Modifie un agent (PUT = modification complète)"""
        logger.info(f"Modification complète agent ID {pk}")
        agent = get_object_or_404(Agent, pk=pk)
        
        serializer = AgentUpdateSerializer(agent, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        agent = serializer.save()
        
        return Response({
            'message': 'Agent mis à jour avec succès',
            'agent': AgentDetailSerializer(agent).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie partiellement un agent",
        request_body=AgentUpdateSerializer,
        responses={200: AgentDetailSerializer()}
    )
    def patch(self, request, pk):
        """Modifie partiellement un agent (PATCH = modification partielle)"""
        logger.info(f"Modification partielle agent ID {pk}")
        agent = get_object_or_404(Agent, pk=pk)
        
        serializer = AgentUpdateSerializer(agent, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        agent = serializer.save()
        
        return Response({
            'message': 'Agent mis à jour avec succès',
            'agent': AgentDetailSerializer(agent).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Supprime un agent",
        responses={204: "Agent supprimé avec succès"}
    )
    def delete(self, request, pk):
        """Supprime un agent"""
        logger.info(f"Suppression agent ID {pk}")
        agent = get_object_or_404(Agent, pk=pk)
        numero = agent.numero_identification
        agent.delete()
        logger.info(f"Agent supprimé : {numero}")
        
        return Response({
            'message': 'Agent supprimé avec succès'
        }, status=status.HTTP_200_OK)

# ==================== CLIENTS ====================

class ClientListCreateView(APIView):
    """
    GET: Liste tous les clients avec filtres optionnels
    POST: Crée un nouveau client
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Liste tous les clients avec filtres optionnels",
        manual_parameters=[
            openapi.Parameter(
                'type_client',
                openapi.IN_QUERY,
                description="Filtrer par type (détaillant, grossiste, institution)",
                type=openapi.TYPE_STRING,
                enum=['détaillant', 'grossiste', 'institution']
            ),
            openapi.Parameter(
                'statut',
                openapi.IN_QUERY,
                description="Filtrer par statut (actif, inactif)",
                type=openapi.TYPE_STRING,
                enum=['actif', 'inactif']
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Rechercher par nom du point de vente, nom du responsable ou code client",
                type=openapi.TYPE_STRING
            ),
        ],
        responses={200: ClientListSerializer(many=True)}
    )
    def get(self, request):
        """Liste tous les clients"""
        logger.info("Récupération de la liste des clients")
        
        clients = Client.objects.all().order_by('-created_at')
        
        # Filtre par type
        type_client = request.query_params.get('type_client')
        if type_client:
            clients = clients.filter(type_client=type_client)
            logger.info(f"Filtre type_client appliqué : {type_client}")
        
        # Filtre par statut
        statut = request.query_params.get('statut')
        if statut:
            clients = clients.filter(statut=statut)
            logger.info(f"Filtre statut appliqué : {statut}")
        
        # Recherche
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            clients = clients.filter(
                Q(nom_point_vente__icontains=search) |
                Q(nom_responsable__icontains=search) |
                Q(code_client__icontains=search) |
                Q(telephone__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = ClientListSerializer(clients, many=True)
        logger.info(f"{clients.count()} clients trouvés")
        
        return Response({
            'count': clients.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Crée un nouveau client",
        request_body=ClientCreateSerializer,
        responses={201: ClientDetailSerializer()}
    )
    def post(self, request):
        """Crée un nouveau client"""
        logger.info("Création d'un nouveau client")
        
        serializer = ClientCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        
        return Response({
            'message': 'Client créé avec succès',
            'client': ClientDetailSerializer(client).data
        }, status=status.HTTP_201_CREATED)


class ClientDetailView(APIView):
    """
    GET: Récupère un client spécifique
    PUT/PATCH: Modifie un client
    DELETE: Supprime un client
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Récupère les détails d'un client",
        responses={200: ClientDetailSerializer()}
    )
    def get(self, request, pk):
        """Récupère un client"""
        logger.info(f"Récupération client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        serializer = ClientDetailSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie un client",
        request_body=ClientUpdateSerializer,
        responses={200: ClientDetailSerializer()}
    )
    def put(self, request, pk):
        """Modifie un client (PUT = modification complète)"""
        logger.info(f"Modification complète client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        
        serializer = ClientUpdateSerializer(client, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        
        return Response({
            'message': 'Client mis à jour avec succès',
            'client': ClientDetailSerializer(client).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie partiellement un client",
        request_body=ClientUpdateSerializer,
        responses={200: ClientDetailSerializer()}
    )
    def patch(self, request, pk):
        """Modifie partiellement un client (PATCH = modification partielle)"""
        logger.info(f"Modification partielle client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        
        serializer = ClientUpdateSerializer(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        
        return Response({
            'message': 'Client mis à jour avec succès',
            'client': ClientDetailSerializer(client).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Supprime un client",
        responses={204: "Client supprimé avec succès"}
    )
    def delete(self, request, pk):
        """Supprime un client"""
        logger.info(f"Suppression client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        code = client.code_client
        client.delete()
        logger.info(f"Client supprimé : {code}")
        
        return Response({
            'message': 'Client supprimé avec succès'
        }, status=status.HTTP_200_OK)