from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from authentication.models import Admin, Agent, Client, Tricycle
from .serializers import (
    AgentCreateSerializer, AgentUpdateSerializer, AgentListSerializer, 
    AgentDetailSerializer,
    ClientCreateSerializer, ClientUpdateSerializer, ClientListSerializer,
    ClientDetailSerializer,
    TricycleSerializer
)
from .permissions import IsAdmin, IsAdminOrReadOnly

logger = logging.getLogger('users')


# ==================== TRICYCLES ====================

class TricycleViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les tricycles"""
    queryset = Tricycle.objects.all()
    serializer_class = TricycleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def list(self, request):
        logger.info("Récupération de la liste des tricycles")
        tricycles = self.get_queryset()
        serializer = self.get_serializer(tricycles, many=True)
        logger.info(f"{tricycles.count()} tricycles récupérés")
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def create(self, request):
        logger.info("Création d'un nouveau tricycle")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f"Tricycle créé : {serializer.data['plaque_immatriculation']}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None):
        logger.info(f"Récupération du tricycle ID {pk}")
        tricycle = get_object_or_404(Tricycle, pk=pk)
        serializer = self.get_serializer(tricycle)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update(self, request, pk=None):
        logger.info(f"Mise à jour du tricycle ID {pk}")
        tricycle = get_object_or_404(Tricycle, pk=pk)
        serializer = self.get_serializer(tricycle, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f"Tricycle mis à jour : {serializer.data['plaque_immatriculation']}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def destroy(self, request, pk=None):
        logger.info(f"Suppression du tricycle ID {pk}")
        tricycle = get_object_or_404(Tricycle, pk=pk)
        plaque = tricycle.plaque_immatriculation
        tricycle.delete()
        logger.info(f"Tricycle supprimé : {plaque}")
        return Response(
            {"message": "Tricycle supprimé avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )

# ==================== AGENTS ====================

class AgentListView(APIView):
    """Lister tous les agents"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('statut', openapi.IN_QUERY, description="Filtrer par statut", type=openapi.TYPE_STRING),
            openapi.Parameter('search', openapi.IN_QUERY, description="Rechercher par nom, email ou numéro", type=openapi.TYPE_STRING),
        ],
        responses={200: AgentListSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des agents")
        
        agents = Agent.objects.all().order_by('-created_at')
        
        # Filtrer par statut
        statut = request.query_params.get('statut', None)
        if statut:
            agents = agents.filter(statut=statut)
            logger.info(f"Filtre appliqué : statut={statut}")
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            agents = agents.filter(
                nom__icontains=search
            ) | agents.filter(
                prenom__icontains=search
            ) | agents.filter(
                email__icontains=search
            ) | agents.filter(
                numero_identification__icontains=search
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = AgentListSerializer(agents, many=True)
        logger.info(f"{agents.count()} agents récupérés")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class AgentCreateView(APIView):
    """Créer un agent"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        request_body=AgentCreateSerializer,
        responses={201: AgentDetailSerializer()}
    )
    def post(self, request):
        logger.info("Demande de création d'agent")
        serializer = AgentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        agent = serializer.save()
        
        return Response(
            AgentDetailSerializer(agent).data,
            status=status.HTTP_201_CREATED
        )


class AgentDetailView(APIView):
    """Récupérer, modifier ou supprimer un agent"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(responses={200: AgentDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de l'agent ID {pk}")
        agent = get_object_or_404(Agent, pk=pk)
        serializer = AgentDetailSerializer(agent)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=AgentUpdateSerializer,
        responses={200: AgentDetailSerializer()}
    )
    def put(self, request, pk):
        logger.info(f"Mise à jour de l'agent ID {pk}")
        agent = get_object_or_404(Agent, pk=pk)
        serializer = AgentUpdateSerializer(agent, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        agent = serializer.save()
        
        return Response(
            AgentDetailSerializer(agent).data,
            status=status.HTTP_200_OK
        )
    
    def delete(self, request, pk):
        logger.info(f"Suppression de l'agent ID {pk}")
        agent = get_object_or_404(Agent, pk=pk)
        numero = agent.numero_identification
        agent.delete()
        logger.info(f"Agent supprimé : {numero}")
        
        return Response(
            {"message": "Agent supprimé avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )

# ==================== CLIENTS ====================

class ClientListView(APIView):
    """Lister tous les clients"""
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('type_client', openapi.IN_QUERY, description="Filtrer par type", type=openapi.TYPE_STRING),
            openapi.Parameter('statut', openapi.IN_QUERY, description="Filtrer par statut", type=openapi.TYPE_STRING),
            openapi.Parameter('search', openapi.IN_QUERY, description="Rechercher par nom ou code", type=openapi.TYPE_STRING),
        ],
        responses={200: ClientListSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des clients")
        
        clients = Client.objects.all().order_by('-created_at')
        
        # Filtrer par type
        type_client = request.query_params.get('type_client', None)
        if type_client:
            clients = clients.filter(type_client=type_client)
            logger.info(f"Filtre appliqué : type_client={type_client}")
        
        # Filtrer par statut
        statut = request.query_params.get('statut', None)
        if statut:
            clients = clients.filter(statut=statut)
            logger.info(f"Filtre appliqué : statut={statut}")
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            clients = clients.filter(
                nom_point_vente__icontains=search
            ) | clients.filter(
                nom_responsable__icontains=search
            ) | clients.filter(
                code_client__icontains=search
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = ClientListSerializer(clients, many=True)
        logger.info(f"{clients.count()} clients récupérés")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClientCreateView(APIView):
    """Créer un client"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=ClientCreateSerializer,
        responses={201: ClientDetailSerializer()}
    )
    def post(self, request):
        logger.info("Demande de création de client")
        serializer = ClientCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        
        return Response(
            ClientDetailSerializer(client).data,
            status=status.HTTP_201_CREATED
        )


class ClientDetailView(APIView):
    """Récupérer, modifier ou supprimer un client"""
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @swagger_auto_schema(responses={200: ClientDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération du client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        serializer = ClientDetailSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=ClientUpdateSerializer,
        responses={200: ClientDetailSerializer()}
    )
    def put(self, request, pk):
        logger.info(f"Mise à jour du client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        serializer = ClientUpdateSerializer(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        
        logger.info(f"Client mis à jour : {client.code_client}")
        
        return Response(
            ClientDetailSerializer(client).data,
            status=status.HTTP_200_OK
        )
    
    def delete(self, request, pk):
        logger.info(f"Suppression du client ID {pk}")
        client = get_object_or_404(Client, pk=pk)
        code = client.code_client
        client.delete()
        logger.info(f"Client supprimé : {code}")
        
        return Response(
            {"message": "Client supprimé avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )
