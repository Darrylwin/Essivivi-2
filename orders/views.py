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
from .permissions import IsClient, IsAgent, IsClientOrAdmin
from users.permissions import IsAdmin

logger = logging.getLogger('orders')


# ==================== COMMANDES ====================

class CommandeCreateView(APIView):
    """Créer une commande (Client uniquement)"""
    permission_classes = [IsAuthenticated, IsClient]
    
    @swagger_auto_schema(
        request_body=CommandeCreateSerializer,
        responses={
            201: CommandeDetailSerializer(),
            400: "Validation échouée"
        }
    )
    def post(self, request):
        logger.info(f"Demande de création de commande par {request.user.email}")
        
        serializer = CommandeCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        
        return Response(
            CommandeDetailSerializer(commande).data,
            status=status.HTTP_201_CREATED
        )


class CommandeListView(APIView):
    """Lister les commandes"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('statut', openapi.IN_QUERY, description="Filtrer par statut", type=openapi.TYPE_STRING),
            openapi.Parameter('agent_id', openapi.IN_QUERY, description="Filtrer par agent (admin)", type=openapi.TYPE_INTEGER),
            openapi.Parameter('client_id', openapi.IN_QUERY, description="Filtrer par client (admin)", type=openapi.TYPE_INTEGER),
            openapi.Parameter('search', openapi.IN_QUERY, description="Rechercher par nom client", type=openapi.TYPE_STRING),
        ],
        responses={200: CommandeListSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des commandes")
        
        # Déterminer le type d'utilisateur
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if is_admin:
            # Admin voit toutes les commandes
            commandes = Commande.objects.all()
            logger.info("Accès admin : toutes les commandes")
        else:
            # Vérifier si c'est un client ou un agent
            try:
                client = Client.objects.get(email=request.user.email)
                commandes = Commande.objects.filter(client=client)
                logger.info(f"Accès client : commandes de {client.code_client}")
            except Client.DoesNotExist:
                try:
                    agent = Agent.objects.get(email=request.user.email)
                    commandes = Commande.objects.filter(agent=agent)
                    logger.info(f"Accès agent : commandes de {agent.numero_identification}")
                except Agent.DoesNotExist:
                    return Response(
                        {"error": "Utilisateur non autorisé"},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        commandes = commandes.order_by('-created_at')
        
        # Filtrer par statut
        statut = request.query_params.get('statut', None)
        if statut:
            commandes = commandes.filter(statut=statut)
            logger.info(f"Filtre statut appliqué : {statut}")
        
        # Filtrer par agent (admin uniquement)
        agent_id = request.query_params.get('agent_id', None)
        if agent_id and is_admin:
            commandes = commandes.filter(agent_id=agent_id)
            logger.info(f"Filtre agent_id appliqué : {agent_id}")
        
        # Filtrer par client (admin uniquement)
        client_id = request.query_params.get('client_id', None)
        if client_id and is_admin:
            commandes = commandes.filter(client_id=client_id)
            logger.info(f"Filtre client_id appliqué : {client_id}")
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            commandes = commandes.filter(
                Q(client__nom_point_vente__icontains=search) |
                Q(client__code_client__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = CommandeListSerializer(commandes, many=True)
        logger.info(f"{commandes.count()} commandes récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommandeDetailView(APIView):
    """Récupérer, modifier ou supprimer une commande"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: CommandeDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de la commande ID {pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            # Client ne peut voir que ses commandes
            try:
                client = Client.objects.get(email=request.user.email)
                if commande.client != client:
                    logger.warning(
                        f"Client {client.code_client} tente d'accéder "
                        f"à une commande d'un autre client"
                    )
                    return Response(
                        {"error": "Vous ne pouvez consulter que vos propres commandes"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Client.DoesNotExist:
                # Agent ne peut voir que ses commandes assignées
                try:
                    agent = Agent.objects.get(email=request.user.email)
                    if commande.agent != agent:
                        logger.warning(
                            f"Agent {agent.numero_identification} tente d'accéder "
                            f"à une commande d'un autre agent"
                        )
                        return Response(
                            {"error": "Vous ne pouvez consulter que vos commandes assignées"},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Agent.DoesNotExist:
                    return Response(
                        {"error": "Utilisateur non autorisé"},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        serializer = CommandeDetailSerializer(commande)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=CommandeUpdateSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def put(self, request, pk):
        """Modifier une commande (Admin ou Client propriétaire)"""
        logger.info(f"Mise à jour de la commande ID {pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            try:
                client = Client.objects.get(email=request.user.email)
                if commande.client != client:
                    return Response(
                        {"error": "Vous ne pouvez modifier que vos propres commandes"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # Client ne peut modifier que si statut = en_attente
                if commande.statut != 'en_attente':
                    return Response(
                        {"error": "Vous ne pouvez modifier que les commandes en attente"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Client.DoesNotExist:
                return Response(
                    {"error": "Seuls les clients et admins peuvent modifier une commande"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = CommandeUpdateSerializer(
            commande,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        
        logger.info(f"Commande mise à jour : #{commande.id}")
        
        return Response(
            CommandeDetailSerializer(commande).data,
            status=status.HTTP_200_OK
        )
    
    @swagger_auto_schema(
        responses={204: "Commande supprimée avec succès"}
    )
    def delete(self, request, pk):
        """Supprimer une commande (Admin uniquement)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            logger.warning(f"Tentative de suppression par non-admin : {request.user.email}")
            return Response(
                {"error": "Seuls les administrateurs peuvent supprimer des commandes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Suppression de la commande ID {pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        commande_info = f"#{commande.id} - Client {commande.client.code_client}"
        commande.delete()
        
        logger.info(f"Commande supprimée : {commande_info}")
        
        return Response(
            {"message": "Commande supprimée avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )


class CommandeAssignView(APIView):
    """Assigner une commande à un agent (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        request_body=CommandeAssignSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def post(self, request, pk):
        logger.info(f"Assignation de la commande ID {pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        serializer = CommandeAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        agent_id = serializer.validated_data['agent_id']
        agent = Agent.objects.get(id=agent_id)
        
        # Assigner l'agent
        old_agent = commande.agent
        commande.agent = agent
        commande.statut = 'acceptee'
        commande.save()
        
        # Créer une notification pour l'agent
        Notification.objects.create(
            type='livraison_assignee',
            agent=agent,
            client=commande.client,
            commande=commande,
            titre='Nouvelle commande assignée',
            message=(
                f"Une commande de {commande.quantite_demandee} unités vous a été assignée. "
                f"Client : {commande.client.nom_point_vente} ({commande.client.code_client})"
            )
        )
        
        # Créer une notification pour le client
        Notification.objects.create(
            type='livraison_assignee',
            client=commande.client,
            commande=commande,
            titre='Commande acceptée',
            message=(
                f"Votre commande #{commande.id} a été acceptée et assignée à un agent. "
            )
        )
        
        if old_agent:
            logger.info(
                f"Commande #{commande.id} réassignée : "
                f"{old_agent.numero_identification} → {agent.numero_identification}"
            )
        else:
            logger.info(
                f"Commande #{commande.id} assignée à {agent.numero_identification}"
            )
        
        return Response(
            CommandeDetailSerializer(commande).data,
            status=status.HTTP_200_OK
        )


class CommandeStatusView(APIView):
    """Changer le statut d'une commande (Admin ou Agent assigné)"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=CommandeStatusSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def patch(self, request, pk):
        logger.info(f"Changement de statut pour la commande ID {pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        # Vérifier les permissions
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            # Vérifier que c'est l'agent assigné
            try:
                agent = Agent.objects.get(email=request.user.email)
                if commande.agent != agent:
                    return Response(
                        {"error": "Seul l'agent assigné peut changer le statut"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                return Response(
                    {"error": "Seuls les agents et admins peuvent changer le statut"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = CommandeStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_statut = commande.statut
        new_statut = serializer.validated_data['statut']
        commande.statut = new_statut
        commande.save()
        
        # Créer une notification si la commande est livrée
        if new_statut == 'livree':
            Notification.objects.create(
                type='livraison_terminee',
                client=commande.client,
                commande=commande,
                titre='Commande livrée',
                message=(
                    f"Votre commande #{commande.id} a été livrée avec succès."
                )
            )
        
        logger.info(
            f"Statut de la commande #{commande.id} changé : {old_statut} → {new_statut}"
        )
        
        return Response(
            CommandeDetailSerializer(commande).data,
            status=status.HTTP_200_OK
        )


# ==================== NOTIFICATIONS ====================

class NotificationListView(APIView):
    """Lister les notifications de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('lue', openapi.IN_QUERY, description="Filtrer par statut de lecture (true/false)", type=openapi.TYPE_BOOLEAN),
        ],
        responses={200: NotificationSerializer(many=True)}
    )
    def get(self, request):
        logger.info(f"Récupération des notifications pour {request.user.email}")
        
        # Déterminer le type d'utilisateur
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if is_admin:
            # Admin voit toutes les notifications
            notifications = Notification.objects.all()
        else:
            try:
                agent = Agent.objects.get(email=request.user.email)
                notifications = Notification.objects.filter(agent=agent)
            except Agent.DoesNotExist:
                try:
                    client = Client.objects.get(email=request.user.email)
                    notifications = Notification.objects.filter(client=client)
                except Client.DoesNotExist:
                    return Response(
                        {"error": "Utilisateur non trouvé"},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        # Filtrer par statut de lecture
        lue = request.query_params.get('lue', None)
        if lue is not None:
            lue_bool = lue.lower() == 'true'
            notifications = notifications.filter(lue=lue_bool)
        
        notifications = notifications.order_by('-created_at')
        
        serializer = NotificationSerializer(notifications, many=True)
        logger.info(f"{notifications.count()} notifications récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationMarkAsReadView(APIView):
    """Marquer une notification comme lue"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: NotificationSerializer()})
    def patch(self, request, pk):
        logger.info(f"Marquage de la notification ID {pk} comme lue")
        notification = get_object_or_404(Notification, pk=pk)
        
        # Vérifier que la notification appartient à l'utilisateur
        is_admin = hasattr(request.user, 'is_staff') and request.user.is_staff
        
        if not is_admin:
            try:
                agent = Agent.objects.get(email=request.user.email)
                if notification.agent != agent:
                    return Response(
                        {"error": "Cette notification ne vous appartient pas"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agent.DoesNotExist:
                try:
                    client = Client.objects.get(email=request.user.email)
                    if notification.client != client:
                        return Response(
                            {"error": "Cette notification ne vous appartient pas"},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Client.DoesNotExist:
                    return Response(
                        {"error": "Utilisateur non autorisé"},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        notification.lue = True
        notification.save()
        
        logger.info(f"Notification #{notification.id} marquée comme lue")
        
        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK
        )