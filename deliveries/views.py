from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Livraison
from authentication.models import Agent, Client
from .serializers import (
    LivraisonCreateSerializer, LivraisonListSerializer,
    LivraisonDetailSerializer
)
from .permissions import IsAgent

logger = logging.getLogger('deliveries')


# ==================== LIVRAISONS ====================

class LivraisonCreateView(APIView):
    """
    Créer une livraison
    
    - Agent : Peut créer des livraisons pendant sa tournée
    - Admin : Peut créer des livraisons manuellement (correction, rattrapage)
    """
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(
        operation_description="""
        Créer une nouvelle livraison avec plusieurs produits.
        
        **Agent :** Doit être en tournée. La distance avec le client doit être ≤ 2m.
        **Admin :** Peut créer sans contrainte de tournée ou de distance.
        """,
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['lignes', 'latitude', 'longitude'],
            properties={
                'client_id': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='ID du client existant (optionnel si nouveau client)'
                ),
                'nom_point_vente': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Nom du point de vente (si nouveau client)'
                ),
                'nom_responsable': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Nom du responsable (si nouveau client)'
                ),
                'telephone': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Téléphone (si nouveau client)'
                ),
                'adresse': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Adresse (si nouveau client)'
                ),
                'type_client': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['detaillant', 'grossiste', 'institution'],
                    description='Type de client (si nouveau client)'
                ),
                'lignes': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'produit_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'quantite': openapi.Schema(type=openapi.TYPE_INTEGER, minimum=1)
                        }
                    ),
                    description='Liste des produits livrés'
                ),
                'latitude': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Latitude GPS de la livraison'
                ),
                'longitude': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Longitude GPS de la livraison'
                ),
            },
            example={
                "client_id": 1,
                "lignes": [
                    {"produit_id": 1, "quantite": 10},
                    {"produit_id": 2, "quantite": 5}
                ],
                "latitude": 6.1319,
                "longitude": 1.2224
            }
        ),
        responses={
            201: LivraisonDetailSerializer(),
            400: "Validation échouée"
        }
    )
    def post(self, request):
        logger.info(f"Demande de création de livraison par {request.user.email}")
        
        # Déterminer si c'est un admin
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        serializer = LivraisonCreateSerializer(
            data=request.data,
            context={'request': request, 'is_admin': is_admin}
        )
        serializer.is_valid(raise_exception=True)
        livraison = serializer.save()
        
        return Response(
            LivraisonDetailSerializer(livraison).data,
            status=status.HTTP_201_CREATED
        )

class LivraisonListView(APIView):
    """Lister les livraisons"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('date', openapi.IN_QUERY, description="Filtrer par date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('client_id', openapi.IN_QUERY, description="Filtrer par client", type=openapi.TYPE_INTEGER),
            openapi.Parameter('agent_id', openapi.IN_QUERY, description="Filtrer par agent", type=openapi.TYPE_INTEGER),
            openapi.Parameter('search', openapi.IN_QUERY, description="Rechercher par nom client ou code", type=openapi.TYPE_STRING),
        ],
        responses={200: LivraisonListSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des livraisons")
        
        # Déterminer le type d'utilisateur
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if is_admin:
            # Admin voit toutes les livraisons
            livraisons = Livraison.objects.all()
            logger.info("Accès admin : toutes les livraisons")
        else:
            # Vérifier si c'est un agent ou un client
            try:
                agent = Agent.objects.get(email=request.user.email)
                livraisons = Livraison.objects.filter(agent=agent)
                logger.info(f"Accès agent : livraisons de {agent.numero_identification}")
            except Agent.DoesNotExist:
                try:
                    client = Client.objects.get(email=request.user.email)
                    livraisons = Livraison.objects.filter(client=client)
                    logger.info(f"Accès client : livraisons de {client.code_client}")
                except Client.DoesNotExist:
                    return Response(
                        {"error": "Utilisateur non autorisé"},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        livraisons = livraisons.order_by('-date_livraison', '-heure_livraison')
        
        # Filtrer par date
        date = request.query_params.get('date', None)
        if date:
            livraisons = livraisons.filter(date_livraison=date)
            logger.info(f"Filtre date appliqué : {date}")
        
        # Filtrer par client (admin/agent uniquement)
        client_id = request.query_params.get('client_id', None)
        if client_id and is_admin:
            livraisons = livraisons.filter(client_id=client_id)
            logger.info(f"Filtre client_id appliqué : {client_id}")
        
        # Filtrer par agent (admin uniquement)
        agent_id = request.query_params.get('agent_id', None)
        if agent_id and is_admin:
            livraisons = livraisons.filter(agent_id=agent_id)
            logger.info(f"Filtre agent_id appliqué : {agent_id}")
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            livraisons = livraisons.filter(
                Q(client__nom_point_vente__icontains=search) |
                Q(client__code_client__icontains=search) |
                Q(client__nom_responsable__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = LivraisonListSerializer(livraisons, many=True)
        logger.info(f"{livraisons.count()} livraisons récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class LivraisonDetailView(APIView):
    """Récupérer les détails d'une livraison"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: LivraisonDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de la livraison ID {pk}")
        livraison = get_object_or_404(Livraison, pk=pk)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            # Vérifier que l'agent ne consulte que ses livraisons
            try:
                agent = Agent.objects.get(email=request.user.email)
                if livraison.agent != agent:
                    logger.warning(
                        f"Agent {agent.numero_identification} tente d'accéder "
                        f"à une livraison d'un autre agent"
                    )
                    return Response(
                        {"error": "Vous ne pouvez consulter que vos propres livraisons"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                # Vérifier que le client ne consulte que ses livraisons
                try:
                    client = Client.objects.get(email=request.user.email)
                    if livraison.client != client:
                        logger.warning(
                            f"Client {client.code_client} tente d'accéder "
                            f"à une livraison d'un autre client"
                        )
                        return Response(
                            {"error": "Vous ne pouvez consulter que vos propres livraisons"},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Client.DoesNotExist:
                    return Response(
                        {"error": "Utilisateur non autorisé"},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        serializer = LivraisonDetailSerializer(livraison)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        responses={204: "Livraison supprimée avec succès"}
    )
    def delete(self, request, pk):
        """Supprimer une livraison (Admin uniquement)"""
        # Vérifier que c'est un admin
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            logger.warning(f"Tentative de suppression par non-admin : {request.user.email}")
            return Response(
                {"error": "Seuls les administrateurs peuvent supprimer des livraisons"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Suppression de la livraison ID {pk}")
        livraison = get_object_or_404(Livraison, pk=pk)
        
        livraison_info = (
            f"#{livraison.id} - Agent {livraison.agent.numero_identification} "
            f"→ Client {livraison.client.code_client}"
        )
        livraison.delete()
        
        logger.info(f"Livraison supprimée : {livraison_info}")
        
        return Response(
            {"message": "Livraison supprimée avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )