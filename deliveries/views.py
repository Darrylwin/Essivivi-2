from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from deliveries.permissions import IsAgentOrAdmin
import logging

from .models import Livraison
from authentication.models import Agent, Client
from orders.models import Commande
from .serializers import (
    LivraisonCreateForCommandeSerializer,
    LivraisonCreateSansCommandeSerializer,
    LivraisonListSerializer,
    LivraisonDetailSerializer
)
from .permissions import IsAgent

logger = logging.getLogger('deliveries')


# ==================== LIVRAISONS ====================

class LivraisonCreateView(APIView):
    """
    Créer une livraison
    
    Deux scénarios :
    1. Pour une commande assignée (commande_id requis) ← SCÉNARIO PRINCIPAL
    2. Livraison directe sans commande (client info requis) ← SCÉNARIO SECONDAIRE
    """
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        operation_description="""Créer une nouvelle livraison.""",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'commande_id': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='ID de la commande à livrer'
                ),
            },
            required=['latitude', 'longitude'],
        ),
        responses={
            201: LivraisonDetailSerializer(),
            400: "Validation échouée",
            403: "Permission refusée"
        }
    )
    def post(self, request):
        """Créer une livraison"""
        logger.info(f"Demande de création de livraison par {request.user.email}")
        
        serializer = LivraisonCreateForCommandeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # VALIDATION SUPPLÉMENTAIRE CRITIQUE
        commande_id = serializer.validated_data['_commande'].id
        
        # Récupérer l'agent
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Agent non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # VÉRIFIER QUE LA COMMANDE EST CELLE ASSIGNÉE À L'AGENT
        commande_assignee = Commande.objects.filter(
            agent=agent,
            statut='en_cours'
        ).first()
        
        if not commande_assignee:
            logger.warning(
                f"Agent {agent.numero_identification} tente de livrer "
                f"sans commande en cours"
            )
            return Response(
                {
                    'error': 'Aucune commande en cours',
                    'detail': 'Vous devez avoir une commande en cours pour effectuer une livraison',
                    'suggestion': 'Démarrez d\'abord une tournée avec une commande assignée'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if commande_assignee.id != commande_id:
            logger.warning(
                f"Agent {agent.numero_identification} tente de livrer "
                f"commande #{commande_id} mais sa commande assignée est #{commande_assignee.id}"
            )
            return Response(
                {
                    'error': 'Commande non autorisée',
                    'detail': f'Vous ne pouvez livrer que votre commande assignée (#{commande_assignee.id})',
                    'commande_assignee': commande_assignee.id,
                    'commande_tentee': commande_id
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Tout est OK, créer la livraison
        livraison = serializer.save()
        
        return Response(
            LivraisonDetailSerializer(livraison).data,
            status=status.HTTP_201_CREATED
        )


class LivraisonListView(APIView):
    """Lister les livraisons avec filtres"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('date', openapi.IN_QUERY, description="Filtrer par date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('client_id', openapi.IN_QUERY, description="Filtrer par client", type=openapi.TYPE_INTEGER),
            openapi.Parameter('agent_id', openapi.IN_QUERY, description="Filtrer par agent", type=openapi.TYPE_INTEGER),
            openapi.Parameter('commande_id', openapi.IN_QUERY, description="Filtrer par commande", type=openapi.TYPE_INTEGER),
            openapi.Parameter('search', openapi.IN_QUERY, description="Rechercher par nom client ou code", type=openapi.TYPE_STRING),
        ],
        responses={200: LivraisonListSerializer(many=True)}
    )
    def get(self, request):
        """Lister les livraisons"""
        logger.info(f"Récupération liste livraisons par {request.user.email}")
        
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
        if client_id and (is_admin or request.user.email == Agent.objects.filter(id=client_id).first().email):
            livraisons = livraisons.filter(client_id=client_id)
            logger.info(f"Filtre client_id appliqué : {client_id}")
        
        # Filtrer par agent (admin uniquement)
        agent_id = request.query_params.get('agent_id', None)
        if agent_id and is_admin:
            livraisons = livraisons.filter(agent_id=agent_id)
            logger.info(f"Filtre agent_id appliqué : {agent_id}")
        
        # Filtrer par commande
        commande_id = request.query_params.get('commande_id', None)
        if commande_id:
            livraisons = livraisons.filter(commande_id=commande_id)
            logger.info(f"Filtre commande_id appliqué : {commande_id}")
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            livraisons = livraisons.filter(
                Q(client__nom_point_vente__icontains=search) |
                Q(client__code_client__icontains=search) |
                Q(client__nom_responsable__icontains=search) |
                Q(agent__numero_identification__icontains=search) |
                Q(agent__nom__icontains=search) |
                Q(agent__prenom__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = LivraisonListSerializer(livraisons, many=True)
        logger.info(f"{livraisons.count()} livraisons récupérées")
        
        return Response({
            'count': livraisons.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class LivraisonDetailView(APIView):
    """Récupérer les détails d'une livraison"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: LivraisonDetailSerializer()})
    def get(self, request, pk):
        """Détails d'une livraison"""
        logger.info(f"Récupération de la livraison ID {pk}")
        livraison = get_object_or_404(Livraison.objects.select_related(
            'agent', 'client', 'commande', 'tournee'
        ), pk=pk)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            try:
                agent = Agent.objects.get(email=request.user.email)
                if livraison.agent != agent:
                    return Response(
                        {"error": "Vous ne pouvez consulter que vos propres livraisons"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                try:
                    client = Client.objects.get(email=request.user.email)
                    if livraison.client != client:
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
        responses={200: "Livraison supprimée avec succès"}
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
        
        # Si c'est une livraison pour commande, réinitialiser le statut de la commande
        if livraison.commande:
            commande = livraison.commande
            old_statut = commande.statut
            commande.statut = 'acceptee'  # Revenir au statut précédent
            commande.save()
            logger.info(f"Statut commande #{commande.id} réinitialisé : {old_statut} → {commande.statut}")
        
        # Supprimer la livraison
        livraison_info = (
            f"#{livraison.id} - Agent {livraison.agent.numero_identification} "
            f"→ Client {livraison.client.code_client}"
        )
        livraison.delete()
        
        logger.info(f"Livraison supprimée : {livraison_info}")
        
        return Response(
            {"message": "Livraison supprimée avec succès"},
            status=status.HTTP_200_OK
        )


class LivraisonsCommandesEnCoursView(APIView):
    """Liste des commandes assignées à l'agent et en attente de livraison"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        operation_description="Liste des commandes assignées à l'agent et en attente de livraison",
        responses={200: "Liste des commandes"}
    )
    def get(self, request):
        """Commandes en attente de livraison pour l'agent connecté"""
        logger.info(f"Récupération commandes en cours pour {request.user.email}")
        
        # Récupérer l'agent connecté
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {"error": "Utilisateur non autorisé"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Récupérer les commandes assignées à cet agent et en attente de livraison
        commandes = Commande.objects.filter(
            agent=agent,
            statut__in=['acceptee', 'en_cours']
        ).select_related('client').prefetch_related('lignes')
        
        # Formater la réponse
        result = []
        for commande in commandes:
            result.append({
                'id': commande.id,
                'client': {
                    'id': commande.client.id,
                    'code': commande.client.code_client,
                    'nom': commande.client.nom_point_vente,
                    'telephone': commande.client.telephone
                },
                'latitude_livraison': float(commande.latitude_livraison),
                'longitude_livraison': float(commande.longitude_livraison),
                'adresse_textuelle': commande.adresse_textuelle,
                'statut': commande.statut,
                'created_at': commande.created_at,
                'lignes': [
                    {
                        'id': ligne.id,
                        'produit_id': ligne.produit_id,
                        'produit_nom': ligne.produit.nom,
                        'quantite': ligne.quantite,
                        'prix_unitaire': float(ligne.prix_unitaire),
                        'montant': float(ligne.montant)
                    }
                    for ligne in commande.lignes.all()
                ],
                'quantite_totale': commande.quantite_totale,
                'montant_total': float(commande.montant_total)
            })
        
        logger.info(f"{len(result)} commandes en attente de livraison pour l'agent {agent.numero_identification}")
        
        return Response({
            'count': len(result),
            'results': result
        }, status=status.HTTP_200_OK)