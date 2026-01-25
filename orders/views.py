from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Commande, Notification
from authentication.models import Agent, Client
from .serializers import (
    CommandeCreateSerializer, CommandeListSerializer, CommandeDetailSerializer,
    CommandeAssignSerializer, CommandeStatusSerializer, CommandeUpdateSerializer,
    NotificationSerializer
)
from users.permissions import IsAdmin

logger = logging.getLogger('orders')


def get_user_type(user):
    """Détermine le type d'utilisateur et retourne (type, instance)"""
    if hasattr(user, 'is_staff') and user.is_staff:
        return ('admin', None)
    
    try:
        client = Client.objects.get(email=user.email)
        return ('client', client)
    except Client.DoesNotExist:
        pass
    
    try:
        agent = Agent.objects.get(email=user.email)
        return ('agent', agent)
    except Agent.DoesNotExist:
        pass
    
    return (None, None)


# ==================== COMMANDES ====================

class CommandeListCreateView(APIView):
    """
    GET: Liste les commandes (filtrées selon l'utilisateur)
    POST: Crée une commande (Client uniquement)
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Liste les commandes accessibles à l'utilisateur",
        manual_parameters=[
            openapi.Parameter(
                'statut',
                openapi.IN_QUERY,
                description="Filtrer par statut",
                type=openapi.TYPE_STRING,
                enum=['en_attente', 'acceptee', 'en_cours', 'livree', 'annulee']
            ),
            openapi.Parameter(
                'agent_id',
                openapi.IN_QUERY,
                description="Filtrer par agent (Admin uniquement)",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'client_id',
                openapi.IN_QUERY,
                description="Filtrer par client (Admin uniquement)",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Rechercher par nom de client ou code",
                type=openapi.TYPE_STRING
            ),
        ],
        responses={200: CommandeListSerializer(many=True)}
    )
    def get(self, request):
        """Liste les commandes"""
        logger.info("Récupération de la liste des commandes")
        
        user_type, user_instance = get_user_type(request.user)
        
        # Filtrer les commandes selon le type d'utilisateur
        if user_type == 'admin':
            commandes = Commande.objects.all()
            logger.info("Admin : accès à toutes les commandes")
        elif user_type == 'client':
            commandes = Commande.objects.filter(client=user_instance)
            logger.info(f"Client {user_instance.code_client} : ses commandes")
        elif user_type == 'agent':
            commandes = Commande.objects.filter(agent=user_instance)
            logger.info(f"Agent {user_instance.numero_identification} : ses commandes")
        else:
            return Response(
                {'error': 'Utilisateur non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        commandes = commandes.select_related('client', 'agent').order_by('-created_at')
        
        # Filtres
        statut = request.query_params.get('statut')
        if statut:
            commandes = commandes.filter(statut=statut)
            logger.info(f"Filtre statut : {statut}")
        
        # Filtres admin uniquement
        if user_type == 'admin':
            agent_id = request.query_params.get('agent_id')
            if agent_id:
                commandes = commandes.filter(agent_id=agent_id)
                logger.info(f"Filtre agent_id : {agent_id}")
            
            client_id = request.query_params.get('client_id')
            if client_id:
                commandes = commandes.filter(client_id=client_id)
                logger.info(f"Filtre client_id : {client_id}")
        
        # Recherche
        search = request.query_params.get('search')
        if search:
            commandes = commandes.filter(
                Q(client__nom_point_vente__icontains=search) |
                Q(client__code_client__icontains=search)
            )
            logger.info(f"Recherche : {search}")
        
        serializer = CommandeListSerializer(commandes, many=True)
        logger.info(f"{commandes.count()} commandes trouvées")
        
        return Response({
            'count': commandes.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Crée une nouvelle commande (Client uniquement)",
        request_body=CommandeCreateSerializer,
        responses={201: CommandeDetailSerializer()}
    )
    def post(self, request):
        """Crée une commande (Client uniquement)"""
        user_type, user_instance = get_user_type(request.user)
        
        if user_type != 'client':
            return Response(
                {'error': 'Seuls les clients peuvent créer des commandes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Création commande par client {user_instance.code_client}")
        
        serializer = CommandeCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        
        return Response({
            'message': 'Commande créée avec succès',
            'commande': CommandeDetailSerializer(commande).data
        }, status=status.HTTP_201_CREATED)


class CommandeDetailView(APIView):
    """
    GET: Récupère une commande
    PUT/PATCH: Modifie une commande (Client si en_attente, Admin)
    DELETE: Supprime une commande (Admin uniquement)
    """
    permission_classes = [IsAuthenticated]
    
    def _check_access(self, commande, user_type, user_instance):
        """Vérifie que l'utilisateur peut accéder à cette commande"""
        if user_type == 'admin':
            return True
        elif user_type == 'client':
            return commande.client == user_instance
        elif user_type == 'agent':
            return commande.agent == user_instance
        return False
    
    @swagger_auto_schema(
        operation_description="Récupère les détails d'une commande",
        responses={200: CommandeDetailSerializer()}
    )
    def get(self, request, pk):
        """Récupère une commande"""
        logger.info(f"Récupération commande #{pk}")
        commande = get_object_or_404(
            Commande.objects.select_related('client', 'agent'),
            pk=pk
        )
        
        user_type, user_instance = get_user_type(request.user)
        
        if not self._check_access(commande, user_type, user_instance):
            return Response(
                {'error': 'Vous n\'avez pas accès à cette commande'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CommandeDetailSerializer(commande)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie une commande (tous les champs requis)",
        request_body=CommandeUpdateSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def put(self, request, pk):
        """Modifie une commande (PUT = modification complète)"""
        logger.info(f"Modification complète commande #{pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        user_type, user_instance = get_user_type(request.user)
        
        # Vérifier les permissions
        if user_type == 'admin':
            pass
        elif user_type == 'client':
            if commande.client != user_instance:
                return Response(
                    {'error': 'Vous ne pouvez modifier que vos commandes'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if commande.statut != 'en_attente':
                return Response(
                    {'error': 'Vous ne pouvez modifier que les commandes en attente'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Seuls les clients et admins peuvent modifier une commande'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CommandeUpdateSerializer(
            commande,
            data=request.data,
            partial=False
        )
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        
        return Response({
            'message': 'Commande mise à jour avec succès',
            'commande': CommandeDetailSerializer(commande).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie partiellement une commande",
        request_body=CommandeUpdateSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def patch(self, request, pk):
        """Modifie partiellement une commande (PATCH = modification partielle)"""
        logger.info(f"Modification partielle commande #{pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        user_type, user_instance = get_user_type(request.user)
        
        # Mêmes permissions que PUT
        if user_type == 'admin':
            pass
        elif user_type == 'client':
            if commande.client != user_instance:
                return Response(
                    {'error': 'Vous ne pouvez modifier que vos commandes'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if commande.statut != 'en_attente':
                return Response(
                    {'error': 'Vous ne pouvez modifier que les commandes en attente'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Seuls les clients et admins peuvent modifier une commande'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CommandeUpdateSerializer(
            commande,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        
        return Response({
            'message': 'Commande mise à jour avec succès',
            'commande': CommandeDetailSerializer(commande).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Supprime une commande (Admin uniquement)",
        responses={200: "Commande supprimée"}
    )
    def delete(self, request, pk):
        """Supprime une commande (Admin uniquement)"""
        user_type, _ = get_user_type(request.user)
        
        if user_type != 'admin':
            return Response(
                {'error': 'Seuls les admins peuvent supprimer des commandes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Suppression commande #{pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        info = f"#{commande.id} - Client {commande.client.code_client}"
        commande.delete()
        
        logger.info(f"Commande supprimée : {info}")
        
        return Response({
            'message': 'Commande supprimée avec succès'
        }, status=status.HTTP_200_OK)


class CommandeAssignView(APIView):
    """Assigne une commande à un agent (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="""
        Assigne une commande à un agent DISPONIBLE.
        
        **Conditions strictes:**
        1. Commande doit être en statut 'en_attente'
        2. Agent doit être en statut 'actif' (disponible)
        3. Agent ne doit PAS avoir d'autre commande en cours
        4. Agent doit exister et être actif
        
        **Après assignation:**
        - Commande.statut → 'acceptee'
        - Commande.agent → agent choisi
        - Notification envoyée à l'agent
        - Notification envoyée au client
        
        **Important:** L'agent devra démarrer une tournée avant de pouvoir livrer.
        """,
        request_body=CommandeAssignSerializer,
        responses={
            200: CommandeDetailSerializer(),
            400: "Agent non disponible ou commande non assignable",
            404: "Commande ou agent non trouvé"
        }
    )
    def post(self, request, pk):
        """Assigne un agent à la commande"""
        logger.info(f"Assignation commande #{pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        # ===== VALIDATION 1: Commande doit être en attente =====
        if not commande.peut_etre_assignee:
            return Response(
                {
                    'error': f"Cette commande ne peut pas être assignée (statut actuel: {commande.statut})",
                    'detail': 'Seules les commandes en attente peuvent être assignées'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CommandeAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        agent = Agent.objects.get(id=serializer.validated_data['agent_id'])
        
        # ===== VALIDATION 2: Agent peut recevoir une commande =====
        peut_recevoir, message = Commande.agent_peut_recevoir_commande(agent)
        
        if not peut_recevoir:
            logger.warning(f"Assignation refusée pour commande #{pk}: {message}")
            return Response(
                {
                    'error': 'Agent non disponible',
                    'detail': message,
                    'agent_statut': agent.statut,
                    'suggestion': 'Choisissez un agent avec statut "actif" et sans commande en cours'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== ASSIGNATION =====
        old_agent = commande.agent
        commande.agent = agent
        commande.statut = 'acceptee'
        
        try:
            commande.save()
        except Exception as e:
            logger.error(f"Erreur lors de l'assignation: {str(e)}")
            return Response(
                {
                    'error': 'Erreur lors de l\'assignation',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # ===== NOTIFICATIONS =====
        # Notification pour l'agent
        Notification.objects.create(
            type='livraison_assignee',
            agent=agent,
            client=commande.client,
            commande=commande,
            titre='Nouvelle commande assignée',
            message=(
                f"Commande #{commande.id} vous a été assignée. "
                f"Client : {commande.client.nom_point_vente}. "
                f"Démarrez une tournée pour commencer les livraisons. "
                f"Point de livraison: {commande.latitude_livraison}, {commande.longitude_livraison}"
            )
        )
        
        # Notification pour le client
        Notification.objects.create(
            type='livraison_assignee',
            client=commande.client,
            commande=commande,
            titre='Commande acceptée',
            message=(
                f"Votre commande #{commande.id} a été acceptée et assignée à un agent. "
                f"Vous serez notifié lorsque l'agent démarrera sa tournée."
            )
        )
        
        if old_agent:
            logger.info(
                f"Commande #{commande.id} réassignée : "
                f"{old_agent.numero_identification} → {agent.numero_identification}"
            )
        else:
            logger.info(
                f"Commande #{commande.id} assignée à {agent.numero_identification}. "
                f"Agent peut maintenant démarrer une tournée."
            )
        
        return Response({
            'message': 'Commande assignée avec succès',
            'instructions': 'L\'agent doit démarrer une tournée avant de pouvoir livrer',
            'commande': CommandeDetailSerializer(commande).data
        }, status=status.HTTP_200_OK)


class CommandeStatusView(APIView):
    """Change le statut d'une commande (Admin ou Agent assigné)"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Change le statut d'une commande",
        request_body=CommandeStatusSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def patch(self, request, pk):
        """Change le statut"""
        logger.info(f"Changement statut commande #{pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        user_type, user_instance = get_user_type(request.user)
        
        # Vérifier permissions
        if user_type == 'admin':
            pass
        elif user_type == 'agent':
            if commande.agent != user_instance:
                return Response(
                    {'error': 'Seul l\'agent assigné peut changer le statut'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Seuls les agents et admins peuvent changer le statut'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CommandeStatusSerializer(data=request.data, instance=commande)
        serializer.is_valid(raise_exception=True)
        
        old_statut = commande.statut
        new_statut = serializer.validated_data['statut']
        commande.statut = new_statut
        commande.save()
        
        # Notification si livrée
        if new_statut == 'livree':
            Notification.objects.create(
                type='livraison_terminee',
                client=commande.client,
                commande=commande,
                titre='Commande livrée',
                message=f"Votre commande #{commande.id} a été livrée avec succès"
            )
        
        # Notification si annulée
        if new_statut == 'annulee':
            Notification.objects.create(
                type='commande_annulee',
                client=commande.client,
                commande=commande,
                titre='Commande annulée',
                message=f"Votre commande #{commande.id} a été annulée"
            )
        
        logger.info(f"Statut commande #{commande.id} : {old_statut} → {new_statut}")
        
        return Response({
            'message': f'Statut changé : {old_statut} → {new_statut}',
            'commande': CommandeDetailSerializer(commande).data
        }, status=status.HTTP_200_OK)


class AgentsDisponiblesView(APIView):
    """Liste des agents disponibles pour assignation (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="""Liste tous les agents DISPONIBLES pour recevoir une commande.
        
        **Critères de disponibilité:**
        - Statut = 'actif' (pas en tournée, pas inactif)
        - Aucune commande en cours (statut acceptée ou en_cours)
        
        **Retourne:**
        - Liste des agents disponibles
        - Leur dernière position GPS (si disponible)
        - Nombre total d'agents disponibles
        """,
        responses={200: "Liste des agents disponibles"}
    )
    def get(self, request):
        """Liste les agents disponibles"""
        logger.info("Récupération des agents disponibles pour assignation")
        
        # Agents actifs sans commande en cours
        agents_disponibles = Agent.objects.filter(
            statut='actif'
        ).exclude(
            commandes__statut__in=['acceptee', 'en_cours']
        ).select_related('tricycle').order_by('numero_identification')
        
        # Formater la réponse
        from tracking.models import PositionAgent
        
        agents_data = []
        for agent in agents_disponibles:
            # Récupérer dernière position
            derniere_position = PositionAgent.get_derniere_position(agent)
            
            agent_info = {
                'id': agent.id,
                'numero_identification': agent.numero_identification,
                'nom': agent.nom,
                'prenom': agent.prenom,
                'telephone': agent.telephone,
                'statut': agent.statut,
                'tricycle': agent.tricycle.plaque_immatriculation if agent.tricycle else None,
                'derniere_position': None
            }
            
            if derniere_position:
                agent_info['derniere_position'] = {
                    'latitude': float(derniere_position.latitude),
                    'longitude': float(derniere_position.longitude),
                    'timestamp': derniere_position.timestamp
                }
            
            agents_data.append(agent_info)
        
        logger.info(f"{len(agents_data)} agents disponibles trouvés")
        
        return Response({
            'count': len(agents_data),
            'agents': agents_data,
            'note': 'Ces agents peuvent recevoir une commande immédiatement'
        }, status=status.HTTP_200_OK)


class AgentCommandeEnCoursView(APIView):
    """Récupère la commande en cours de l'agent connecté"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="""Récupère la commande actuellement assignée à l'agent connecté.
        
        **Retourne:**
        - Détails de la commande si elle existe
        - null si aucune commande active
        
        **Statuts possibles:**
        - acceptee: Commande assignée, agent doit démarrer tournée
        - en_cours: Tournée démarrée, agent peut livrer
        """,
        responses={200: "Commande en cours"}
    )
    def get(self, request):
        """Récupère la commande en cours"""
        logger.info(f"Récupération commande en cours pour {request.user.email}")
        
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Agent non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Chercher commande en cours
        commande = Commande.objects.filter(
            agent=agent,
            statut__in=['acceptee', 'en_cours']
        ).select_related('client').prefetch_related('lignes').first()
        
        if not commande:
            return Response({
                'has_commande': False,
                'message': 'Aucune commande assignée. Vous êtes disponible.',
                'agent_statut': agent.statut
            }, status=status.HTTP_200_OK)
        
        return Response({
            'has_commande': True,
            'commande': CommandeDetailSerializer(commande).data,
            'peut_demarrer_tournee': commande.statut == 'acceptee' and agent.statut == 'actif',
            'instructions': (
                'Démarrez une tournée pour commencer les livraisons' 
                if commande.statut == 'acceptee' 
                else 'Tournée en cours, effectuez les livraisons'
            )
        }, status=status.HTTP_200_OK)


# ==================== NOTIFICATIONS ====================

class NotificationListView(APIView):
    """Liste les notifications de l'utilisateur"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Liste les notifications de l'utilisateur connecté",
        manual_parameters=[
            openapi.Parameter(
                'lue',
                openapi.IN_QUERY,
                description="Filtrer par statut de lecture (true/false)",
                type=openapi.TYPE_BOOLEAN
            ),
        ],
        responses={200: NotificationSerializer(many=True)}
    )
    def get(self, request):
        """Liste les notifications"""
        logger.info(f"Récupération notifications pour {request.user.email}")
        
        user_type, user_instance = get_user_type(request.user)
        
        if user_type == 'admin':
            notifications = Notification.objects.all()
        elif user_type == 'agent':
            notifications = Notification.objects.filter(agent=user_instance)
        elif user_type == 'client':
            notifications = Notification.objects.filter(client=user_instance)
        else:
            return Response(
                {'error': 'Utilisateur non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Filtre lecture
        lue = request.query_params.get('lue')
        if lue is not None:
            lue_bool = lue.lower() == 'true'
            notifications = notifications.filter(lue=lue_bool)
        
        notifications = notifications.order_by('-created_at')
        
        serializer = NotificationSerializer(notifications, many=True)
        logger.info(f"{notifications.count()} notifications trouvées")
        
        return Response({
            'count': notifications.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class NotificationMarkAsReadView(APIView):
    """Marque une notification comme lue"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Marque une notification comme lue",
        responses={200: NotificationSerializer()}
    )
    def patch(self, request, pk):
        """Marque comme lue"""
        logger.info(f"Marquage notification #{pk} comme lue")
        notification = get_object_or_404(Notification, pk=pk)
        
        user_type, user_instance = get_user_type(request.user)
        
        # Vérifier ownership
        if user_type == 'admin':
            pass
        elif user_type == 'agent':
            if notification.agent != user_instance:
                return Response(
                    {'error': 'Cette notification ne vous appartient pas'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user_type == 'client':
            if notification.client != user_instance:
                return Response(
                    {'error': 'Cette notification ne vous appartient pas'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Utilisateur non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.lue = True
        notification.save()
        
        logger.info(f"Notification #{notification.id} marquée lue")
        
        return Response({
            'message': 'Notification marquée comme lue',
            'notification': NotificationSerializer(notification).data
        }, status=status.HTTP_200_OK)