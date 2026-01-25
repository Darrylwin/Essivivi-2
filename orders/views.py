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
            openapi.Parameter(
                'lat',
                openapi.IN_QUERY,
                description="Latitude pour filtrer par proximité (optionnel avec lon)",
                type=openapi.TYPE_NUMBER,
                format='decimal'
            ),
            openapi.Parameter(
                'lon',
                openapi.IN_QUERY,
                description="Longitude pour filtrer par proximité (optionnel avec lat)",
                type=openapi.TYPE_NUMBER,
                format='decimal'
            ),
            openapi.Parameter(
                'distance_max',
                openapi.IN_QUERY,
                description="Distance maximale en mètres pour le filtrage par proximité (défaut: 5000)",
                type=openapi.TYPE_NUMBER
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
        
        # Filtrage par proximité géographique
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        if lat and lon:
            try:
                from math import radians, sin, cos, sqrt, atan2
                
                lat_float = float(lat)
                lon_float = float(lon)
                distance_max = float(request.query_params.get('distance_max', 5000))
                
                # Rayon de la Terre en mètres
                R = 6371000
                
                # Convertir latitude en radians
                lat_rad = radians(lat_float)
                
                # Filtre approximatif d'abord (carré)
                deg_per_km = 0.009  # Environ 1km en degrés
                max_distance_deg = (distance_max / 1000) * deg_per_km
                
                commandes = commandes.filter(
                    latitude_livraison__range=(lat_float - max_distance_deg, lat_float + max_distance_deg),
                    longitude_livraison__range=(lon_float - max_distance_deg, lon_float + max_distance_deg)
                )
                
                # Calculer la distance exacte pour chaque commande
                commandes_list = list(commandes)
                filtered_commandes = []
                
                for commande in commandes_list:
                    try:
                        cmd_lat = radians(float(commande.latitude_livraison))
                        cmd_lon = radians(float(commande.longitude_livraison))
                        
                        dlat = cmd_lat - lat_rad
                        dlon = cmd_lon - radians(lon_float)
                        
                        a = sin(dlat/2)**2 + cos(lat_rad) * cos(cmd_lat) * sin(dlon/2)**2
                        c = 2 * atan2(sqrt(a), sqrt(1-a))
                        distance = R * c
                        
                        if distance <= distance_max:
                            filtered_commandes.append(commande)
                    except (TypeError, ValueError):
                        continue
                
                from django.core.paginator import Paginator
                # Recréer un queryset avec les IDs filtrés
                commande_ids = [cmd.id for cmd in filtered_commandes]
                commandes = Commande.objects.filter(id__in=commande_ids).order_by('-created_at')
                
                logger.info(f"Filtre proximité : {lat}, {lon} - {len(filtered_commandes)} commandes dans un rayon de {distance_max}m")
                
            except (ValueError, TypeError) as e:
                logger.error(f"Erreur filtrage proximité : {e}")
        
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
            # Admin peut toujours modifier
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
        operation_description="Assigne une commande à un agent",
        request_body=CommandeAssignSerializer,
        responses={200: CommandeDetailSerializer()}
    )
    def post(self, request, pk):
        """Assigne un agent à la commande"""
        logger.info(f"Assignation commande #{pk}")
        commande = get_object_or_404(Commande, pk=pk)
        
        serializer = CommandeAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        agent = Agent.objects.get(id=serializer.validated_data['agent_id'])
        
        old_agent = commande.agent
        commande.agent = agent
        commande.statut = 'acceptee'
        commande.save()
        
        # Notification pour l'agent
        Notification.objects.create(
            type='livraison_assignee',
            agent=agent,
            client=commande.client,
            commande=commande,
            titre='Nouvelle commande assignée',
            message=(
                f"Commande #{commande.id} vous a été assignée. "
                f"Client : {commande.client.nom_point_vente} - "
                f"Localisation: {commande.latitude_livraison}, {commande.longitude_livraison}"
            )
        )
        
        # Notification pour le client
        Notification.objects.create(
            type='livraison_assignee',
            client=commande.client,
            commande=commande,
            titre='Commande acceptée',
            message=f"Votre commande #{commande.id} a été acceptée et assignée à un agent"
        )
        
        if old_agent:
            logger.info(
                f"Commande #{commande.id} réassignée : "
                f"{old_agent.numero_identification} → {agent.numero_identification}"
            )
        else:
            logger.info(f"Commande #{commande.id} assignée à {agent.numero_identification}")
        
        return Response({
            'message': 'Commande assignée avec succès',
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
                message=f"Votre commande #{commande.id} a été livrée avec succès à {commande.latitude_livraison}, {commande.longitude_livraison}"
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
            # Admin voit toutes les notifications (nouvelles commandes notamment)
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