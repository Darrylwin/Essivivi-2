from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime, time
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging
from decimal import Decimal

from authentication.models import Agent, Client
from tours.models import Tournee
from deliveries.models import Livraison
from orders.models import Commande
from tracking.models import PositionAgent
from .serializers import (
    DashboardAdminSerializer, DashboardAgentSerializer, PerformanceAgentSerializer, KPISerializer
)
from users.permissions import IsAdmin

logger = logging.getLogger('dashboard')


# ==================== DASHBOARD PRINCIPAL ====================

class DashboardAdminView(APIView):
    """Dashboard principal pour l'admin"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(responses={200: DashboardAdminSerializer()})
    def get(self, request):
        logger.info("Récupération du dashboard admin")
        
        aujourdhui = timezone.now().date()
        hier = aujourdhui - timedelta(days=1)
        
        # Agents
        agents_actifs = Agent.objects.filter(statut='actif').count()
        agents_en_tournee = Agent.objects.filter(statut='en_tournee').count()
        
        # Livraisons aujourd'hui
        livraisons_aujourdhui = Livraison.objects.filter(
            date_livraison=aujourdhui
        )
        
        stats_aujourdhui = livraisons_aujourdhui.aggregate(
            total_livraisons=Count('id'),
            quantite_totale=Sum('quantite_livree'),
            montant_total=Sum('montant_percu')
        )
        
        # Livraisons hier (pour comparaison)
        livraisons_hier = Livraison.objects.filter(
            date_livraison=hier
        )
        
        stats_hier = livraisons_hier.aggregate(
            total_livraisons=Count('id'),
            montant_total=Sum('montant_percu')
        )
        
        # Calcul de l'évolution
        livraisons_count = stats_aujourdhui['total_livraisons'] or 0
        livraisons_hier_count = stats_hier['total_livraisons'] or 0
        
        if livraisons_hier_count > 0:
            evolution_livraisons = ((livraisons_count - livraisons_hier_count) / livraisons_hier_count) * 100
        else:
            evolution_livraisons = 100.0 if livraisons_count > 0 else 0.0
        
        montant_aujourdhui = stats_aujourdhui['montant_total'] or Decimal('0')
        montant_hier = stats_hier['montant_total'] or Decimal('0')
        
        if montant_hier > 0:
            evolution_montant = float((montant_aujourdhui - montant_hier) / montant_hier * 100)
        else:
            evolution_montant = 100.0 if montant_aujourdhui > 0 else 0.0
        
        # Commandes en attente
        commandes_en_attente = Commande.objects.filter(statut='en_attente').count()
        
        data = {
            'agents_actifs': agents_actifs,
            'agents_en_tournee': agents_en_tournee,
            'livraisons_aujourdhui': livraisons_count,
            'quantite_totale_aujourdhui': stats_aujourdhui['quantite_totale'] or 0,
            'montant_total_aujourdhui': montant_aujourdhui,
            'commandes_en_attente': commandes_en_attente,
            'livraisons_hier': livraisons_hier_count,
            'evolution_livraisons': round(evolution_livraisons, 2),
            'montant_hier': montant_hier,
            'evolution_montant': round(evolution_montant, 2)
        }
        
        serializer = DashboardAdminSerializer(data)
        logger.info("Dashboard admin généré avec succès")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class DashboardAgentView(APIView):
    """Dashboard pour un agent"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: DashboardAgentSerializer()})
    def get(self, request):
        logger.info(f"Récupération du dashboard agent pour {request.user.email}")
        
        # Récupérer l'agent
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            return Response(
                {"error": "Agent non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        aujourdhui = timezone.now().date()
        debut_semaine = aujourdhui - timedelta(days=aujourdhui.weekday())
        debut_mois = aujourdhui.replace(day=1)
        
        # Statistiques du jour
        livraisons_jour = Livraison.objects.filter(
            agent=agent,
            date_livraison=aujourdhui
        )
        stats_jour = livraisons_jour.aggregate(
            total=Count('id'),
            quantite=Sum('quantite_livree'),
            montant=Sum('montant_percu')
        )
        
        # Statistiques de la semaine
        livraisons_semaine = Livraison.objects.filter(
            agent=agent,
            date_livraison__gte=debut_semaine
        )
        stats_semaine = livraisons_semaine.aggregate(
            total=Count('id'),
            quantite=Sum('quantite_livree'),
            montant=Sum('montant_percu')
        )
        
        # Statistiques du mois
        livraisons_mois = Livraison.objects.filter(
            agent=agent,
            date_livraison__gte=debut_mois
        )
        stats_mois = livraisons_mois.aggregate(
            total=Count('id'),
            quantite=Sum('quantite_livree'),
            montant=Sum('montant_percu')
        )
        
        # Tournée en cours
        tournee_en_cours = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        duree_tournee = None
        if tournee_en_cours:
            delta = timezone.now() - tournee_en_cours.heure_debut
            heures = int(delta.total_seconds() // 3600)
            minutes = int((delta.total_seconds() % 3600) // 60)
            duree_tournee = f"{heures}h {minutes}min"
        
        data = {
            'agent_id': agent.id,
            'agent_numero': agent.numero_identification,
            'agent_nom': f"{agent.prenom} {agent.nom}",
            'livraisons_aujourdhui': stats_jour['total'] or 0,
            'quantite_aujourdhui': stats_jour['quantite'] or 0,
            'montant_aujourdhui': stats_jour['montant'] or Decimal('0'),
            'tournee_en_cours': tournee_en_cours is not None,
            'duree_tournee_actuelle': duree_tournee,
            'livraisons_semaine': stats_semaine['total'] or 0,
            'quantite_semaine': stats_semaine['quantite'] or 0,
            'montant_semaine': stats_semaine['montant'] or Decimal('0'),
            'livraisons_mois': stats_mois['total'] or 0,
            'quantite_mois': stats_mois['quantite'] or 0,
            'montant_mois': stats_mois['montant'] or Decimal('0')
        }
        
        serializer = DashboardAgentSerializer(data)
        logger.info(f"Dashboard agent généré pour {agent.numero_identification}")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==================== STATISTIQUES ====================
class PerformanceAgentsView(APIView):
    """Performance de tous les agents"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('date_debut', openapi.IN_QUERY, description="Date de début (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('date_fin', openapi.IN_QUERY, description="Date de fin (YYYY-MM-DD)", type=openapi.TYPE_STRING),
        ],
        responses={200: PerformanceAgentSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la performance des agents")
        
        # Récupérer les dates
        date_debut_str = request.query_params.get('date_debut', None)
        date_fin_str = request.query_params.get('date_fin', None)
        
        if date_debut_str:
            date_debut = datetime.strptime(date_debut_str, '%Y-%m-%d').date()
        else:
            date_debut = timezone.now().date().replace(day=1)  # Début du mois
        
        if date_fin_str:
            date_fin = datetime.strptime(date_fin_str, '%Y-%m-%d').date()
        else:
            date_fin = timezone.now().date()
        
        # Récupérer tous les agents
        agents = Agent.objects.all()
        
        performances = []
        
        for agent in agents:
            livraisons = Livraison.objects.filter(
                agent=agent,
                date_livraison__gte=date_debut,
                date_livraison__lte=date_fin
            )
            
            stats = livraisons.aggregate(
                total_livraisons=Count('id'),
                total_quantite=Sum('quantite_livree'),
                total_montant=Sum('montant_percu')
            )
            
            total_livraisons = stats['total_livraisons'] or 0
            
            if total_livraisons > 0:
                nombre_jours = (date_fin - date_debut).days + 1
                moyenne_livraisons_jour = total_livraisons / nombre_jours
                montant_moyen = (stats['total_montant'] / total_livraisons)
                
                performances.append({
                    'agent_id': agent.id,
                    'agent_numero': agent.numero_identification,
                    'agent_nom': f"{agent.prenom} {agent.nom}",
                    'total_livraisons': total_livraisons,
                    'total_quantite': stats['total_quantite'] or 0,
                    'total_montant': stats['total_montant'] or Decimal('0'),
                    'moyenne_livraisons_par_jour': round(moyenne_livraisons_jour, 2),
                    'montant_moyen_par_livraison': montant_moyen,
                    'classement': None  # Sera calculé après
                })
        
        # Trier par total_livraisons et attribuer le classement
        performances.sort(key=lambda x: x['total_livraisons'], reverse=True)
        for i, perf in enumerate(performances, start=1):
            perf['classement'] = i
        
        serializer = PerformanceAgentSerializer(performances, many=True)
        logger.info(f"Performance calculée pour {len(performances)} agents")
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class KPIView(APIView):
    """Indicateurs clés de performance (KPI)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(responses={200: KPISerializer()})
    def get(self, request):
        logger.info("Calcul des KPI")
        
        aujourdhui = timezone.now().date()
        debut_semaine = aujourdhui - timedelta(days=aujourdhui.weekday())
        debut_mois = aujourdhui.replace(day=1)
        
        # Taux de livraison (commandes livrées / total commandes)
        total_commandes = Commande.objects.count()
        commandes_livrees = Commande.objects.filter(statut='livree').count()
        taux_livraison = (commandes_livrees / total_commandes * 100) if total_commandes > 0 else 0
        
        # Taux de commandes en attente
        commandes_en_attente = Commande.objects.filter(statut='en_attente').count()
        taux_en_attente = (commandes_en_attente / total_commandes * 100) if total_commandes > 0 else 0
        
        # Chiffre d'affaires
        ca_jour = Livraison.objects.filter(
            date_livraison=aujourdhui
        ).aggregate(total=Sum('montant_percu'))['total'] or Decimal('0')
        
        ca_semaine = Livraison.objects.filter(
            date_livraison__gte=debut_semaine
        ).aggregate(total=Sum('montant_percu'))['total'] or Decimal('0')
        
        ca_mois = Livraison.objects.filter(
            date_livraison__gte=debut_mois
        ).aggregate(total=Sum('montant_percu'))['total'] or Decimal('0')
        
        # Temps moyen de tournée
        tournees_terminees = Tournee.objects.filter(heure_fin__isnull=False)
        if tournees_terminees.exists():
            durees = [t.duree.total_seconds() / 3600 for t in tournees_terminees if t.duree]
            temps_moyen_tournee = sum(durees) / len(durees) if durees else 0
        else:
            temps_moyen_tournee = 0
        
        # Temps moyen de livraison (si enregistré)
        livraisons_avec_duree = Livraison.objects.filter(duree_livraison__isnull=False)
        if livraisons_avec_duree.exists():
            durees_livraison = [l.duree_livraison.total_seconds() / 60 for l in livraisons_avec_duree]
            temps_moyen_livraison = sum(durees_livraison) / len(durees_livraison)
        else:
            temps_moyen_livraison = 0
        
        # Distance moyenne parcourue (si positions enregistrées)
        tournees = Tournee.objects.filter(heure_fin__isnull=False)[:30]  # 30 dernières
        distances = []
        
        for tournee in tournees:
            positions = PositionAgent.objects.filter(tournee=tournee).order_by('timestamp')
            if positions.count() > 1:
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
                distances.append(distance_totale / 1000)  # Convertir en km
        
        distance_moyenne = (sum(distances) / len(distances)) if distances else 0
        
        # Livraisons par agent par jour
        agents_actifs = Agent.objects.filter(statut__in=['actif', 'en_tournee']).count()
        livraisons_jour = Livraison.objects.filter(date_livraison=aujourdhui).count()
        livraisons_par_agent = livraisons_jour / agents_actifs if agents_actifs > 0 else 0
        
        # Quantité moyenne par livraison
        quantite_moy = Livraison.objects.aggregate(
            moyenne=Avg('quantite_livree')
        )['moyenne'] or 0
        
        data = {
            'taux_livraison': round(taux_livraison, 2),
            'taux_commandes_en_attente': round(taux_en_attente, 2),
            'ca_aujourdhui': ca_jour,
            'ca_semaine': ca_semaine,
            'ca_mois': ca_mois,
            'temps_moyen_tournee': round(temps_moyen_tournee, 2),
            'temps_moyen_livraison': round(temps_moyen_livraison, 2),
            'distance_moyenne_parcourue': round(distance_moyenne, 2),
            'livraisons_par_agent_par_jour': round(livraisons_par_agent, 2),
            'quantite_moyenne_par_livraison': round(quantite_moy, 2)
        }
        
        serializer = KPISerializer(data)
        logger.info("KPI calculés avec succès")
        
        return Response(serializer.data, status=status.HTTP_200_OK)