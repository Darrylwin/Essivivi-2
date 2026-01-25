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
from orders.models import Commande
from .serializers import TourneeSerializer, TourneeDetailSerializer
from .permissions import IsAgent, IsAgentOrAdmin

logger = logging.getLogger('tours')


class TourneeStartView(APIView):
    """Démarrer une tournée (AGENT uniquement)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        operation_description="""
        Démarre une nouvelle tournée pour l'agent connecté.
        
        **Conditions STRICTES:**
        1. Agent doit avoir une commande assignée (statut='acceptee')
        2. Agent doit être en statut 'actif' (pas déjà en tournée)
        3. Agent ne doit pas avoir d'autre tournée en cours
        
        **Après démarrage:**
        - Tournée créée et liée à la commande
        - Agent.statut → 'en_tournee'
        - Commande.statut → 'en_cours'
        - Agent peut maintenant effectuer les livraisons
        
        **Important:** Une fois la tournée démarrée, l'agent ne peut plus en démarrer une autre 
        tant qu'il n'a pas terminé celle-ci.
        """,
        responses={
            201: openapi.Response(
                description="Tournée démarrée avec succès",
                examples={
                    "application/json": {
                        "message": "Tournée démarrée",
                        "tournee_id": 45,
                        "heure_debut": "2026-01-25T10:00:00Z",
                        "commande_id": 123,
                        "instructions": "Vous pouvez maintenant effectuer les livraisons de la commande #123"
                    }
                }
            ),
            400: "Conditions non remplies",
            404: "Agent non trouvé"
        }
    )
    def post(self, request):
        logger.info(f"Demande de démarrage tournée pour {request.user.email}")
        
        # ===== RÉCUPÉRATION AGENT =====
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            logger.error(f"Agent non trouvé : {request.user.email}")
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # ===== VALIDATION 1: Agent doit avoir commande assignée =====
        commande = Commande.objects.filter(
            agent=agent,
            statut='acceptee'
        ).first()
        
        if not commande:
            logger.warning(
                f"Agent {agent.numero_identification} tente de démarrer tournée sans commande"
            )
            return Response(
                {
                    "error": "Aucune commande assignée",
                    "detail": "Vous devez avoir une commande assignée par l'admin avant de démarrer une tournée",
                    "suggestion": "Contactez l'administrateur pour qu'il vous assigne une commande"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== VALIDATION 2: Agent ne doit pas déjà être en tournée =====
        if Tournee.objects.filter(agent=agent, heure_fin__isnull=True).exists():
            logger.warning(
                f"Agent {agent.numero_identification} a déjà une tournée en cours"
            )
            return Response(
                {
                    "error": "Vous avez déjà une tournée en cours",
                    "detail": "Terminez votre tournée actuelle avant d'en démarrer une nouvelle"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== VALIDATION 3: Agent doit être actif =====
        if agent.statut != 'actif':
            logger.warning(
                f"Agent {agent.numero_identification} n'est pas actif (statut: {agent.statut})"
            )
            return Response(
                {
                    "error": "Vous n'êtes pas disponible",
                    "detail": f"Votre statut actuel est '{agent.statut}'. Vous devez être 'actif' pour démarrer une tournée.",
                    "statut_actuel": agent.statut
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== CRÉATION TOURNÉE =====
        tournee = Tournee.objects.create(
            agent=agent,
            commande=commande,
            heure_debut=timezone.now()
        )
        
        # ===== MISE À JOUR STATUTS =====
        # 1. Agent passe en tournée
        agent.statut = 'en_tournee'
        agent.save()
        
        # 2. Commande passe en cours
        commande.statut = 'en_cours'
        commande.save()
        
        logger.info(
            f"Tournée #{tournee.id} démarrée - "
            f"Agent {agent.numero_identification} - "
            f"Commande #{commande.id} - "
            f"Statuts mis à jour"
        )
        
        return Response({
            "message": "Tournée démarrée",
            "tournee_id": tournee.id,
            "heure_debut": tournee.heure_debut,
            "commande_id": commande.id,
            "instructions": f"Vous pouvez maintenant effectuer les livraisons de la commande #{commande.id}"
        }, status=status.HTTP_201_CREATED)


class TourneeEndView(APIView):
    """Terminer une tournée (AGENT uniquement)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        operation_description="""
        Termine la tournée en cours de l'agent connecté.
        
        **Conditions STRICTES:**
        1. Agent doit avoir une tournée en cours
        2. Commande de la tournée doit être livrée (statut='livree')
        
        **Après fin:**
        - Tournée.heure_fin → maintenant
        - Agent.statut → 'actif' (redevient disponible)
        - Agent peut recevoir une nouvelle commande
        
        **Important:** Une fois la tournée terminée, l'agent est à nouveau disponible 
        pour recevoir une nouvelle commande.
        """,
        responses={
            200: openapi.Response(
                description="Tournée terminée avec succès",
                examples={
                    "application/json": {
                        "message": "Tournée terminée",
                        "tournee_id": 45,
                        "heure_fin": "2026-01-25T14:30:00Z",
                        "duree": "4h 30m",
                        "recap": {
                            "nombre_livraisons": 3,
                            "quantite_totale": 150,
                            "montant_total": 37500.00
                        }
                    }
                }
            ),
            400: "Commande pas encore livrée",
            404: "Aucune tournée en cours"
        }
    )
    def post(self, request):
        logger.info(f"Demande de fin de tournée pour {request.user.email}")
        
        # ===== RÉCUPÉRATION AGENT =====
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            logger.error(f"Agent non trouvé : {request.user.email}")
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # ===== VALIDATION 1: Récupérer la tournée en cours =====
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).select_related('commande').first()
        
        if not tournee:
            logger.warning(
                f"Agent {agent.numero_identification} n'a pas de tournée en cours"
            )
            return Response(
                {
                    "error": "Aucune tournée en cours",
                    "detail": "Vous devez d'abord démarrer une tournée"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # ===== VALIDATION 2: Commande doit être livrée =====
        peut_terminer, message = tournee.peut_etre_terminee()
        
        if not peut_terminer:
            logger.warning(
                f"Tournée #{tournee.id} ne peut pas être terminée : {message}"
            )
            return Response(
                {
                    "error": "Tournée ne peut pas être terminée",
                    "detail": message,
                    "commande_statut": tournee.commande.statut,
                    "suggestion": "Effectuez toutes les livraisons de la commande avant de terminer la tournée"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== TERMINER TOURNÉE =====
        tournee.heure_fin = timezone.now()
        tournee.save()
        
        # ===== LIBÉRER AGENT =====
        agent.statut = 'actif'
        agent.save()
        
        logger.info(
            f"Tournée #{tournee.id} terminée - "
            f"Agent {agent.numero_identification} redevient disponible - "
            f"Durée: {tournee.duree_formatee} - "
            f"{tournee.nombre_livraisons} livraisons effectuées"
        )
        
        return Response({
            "message": "Tournée terminée",
            "tournee_id": tournee.id,
            "heure_fin": tournee.heure_fin,
            "duree": tournee.duree_formatee,
            "recap": {
                "nombre_livraisons": tournee.nombre_livraisons,
                "quantite_totale": tournee.quantite_totale_livree,
                "montant_total": tournee.montant_total_percu
            },
            "statut": "Vous êtes à nouveau disponible pour recevoir une nouvelle commande"
        }, status=status.HTTP_200_OK)


class TourneeCurrentView(APIView):
    """Vérifier la tournée en cours (AGENT)"""
    permission_classes = [IsAuthenticated, IsAgent]
    
    @swagger_auto_schema(
        operation_description="Récupère les informations de la tournée en cours (si existe)",
        responses={
            200: openapi.Response(
                description="Informations de la tournée",
                examples={
                    "application/json": {
                        "en_cours": True,
                        "tournee_id": 45,
                        "heure_debut": "2026-01-25T10:00:00Z",
                        "commande_id": 123,
                        "duree_actuelle": "2h 15m 30s"
                    }
                }
            )
        }
    )
    def get(self, request):
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).select_related('commande').first()
        
        if tournee:
            return Response({
                "en_cours": True,
                "tournee_id": tournee.id,
                "heure_debut": tournee.heure_debut,
                "commande_id": tournee.commande.id,
                "duree_actuelle": tournee.duree_formatee
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "en_cours": False,
                "message": "Aucune tournée en cours"
            }, status=status.HTTP_200_OK)


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
            tournees = Tournee.objects.filter(agent=agent).select_related(
                'agent', 'commande'
            ).order_by('-heure_debut')
            logger.info(f"Filtre agent appliqué : {agent.numero_identification}")
        except Agent.DoesNotExist:
            # C'est un admin, afficher toutes les tournées
            tournees = Tournee.objects.all().select_related(
                'agent', 'commande'
            ).order_by('-heure_debut')
            
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
        
        return Response({
            'count': tournees.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class TourneeDetailView(APIView):
    """Récupérer les détails d'une tournée"""
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]
    
    @swagger_auto_schema(responses={200: TourneeDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de la tournée ID {pk}")
        tournee = get_object_or_404(
            Tournee.objects.select_related('agent', 'commande'),
            pk=pk
        )
        
        # Vérifier que l'agent ne consulte que ses propres tournées
        try:
            agent = Agent.objects.get(email=request.user.email)
            if tournee.agent != agent:
                logger.warning(
                    f"Agent {agent.numero_identification} tente d'accéder "
                    f"à une tournée d'un autre agent"
                )
                return Response(
                    {"error": "Vous ne pouvez consulter que vos propres tournées"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Agent.DoesNotExist:
            # C'est un admin, pas de restriction
            pass
        
        serializer = TourneeDetailSerializer(tournee)
        return Response(serializer.data, status=status.HTTP_200_OK)