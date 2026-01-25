from rest_framework import serializers


class DashboardAdminSerializer(serializers.Serializer):
    """Serializer pour le dashboard admin"""
    # Vue d'ensemble
    agents_actifs = serializers.IntegerField()
    agents_en_tournee = serializers.IntegerField()
    livraisons_aujourdhui = serializers.IntegerField()
    quantite_totale_aujourdhui = serializers.IntegerField()
    montant_total_aujourdhui = serializers.DecimalField(max_digits=12, decimal_places=2)
    commandes_en_attente = serializers.IntegerField()
    
    # Évolution
    livraisons_hier = serializers.IntegerField()
    evolution_livraisons = serializers.FloatField()  # Pourcentage
    montant_hier = serializers.DecimalField(max_digits=12, decimal_places=2)
    evolution_montant = serializers.FloatField()  # Pourcentage

class KPISerializer(serializers.Serializer):
    """Serializer pour les KPI"""
    # Taux
    taux_livraison = serializers.FloatField()  # Livraisons réussies / total commandes
    taux_commandes_en_attente = serializers.FloatField()
    
    # Chiffre d'affaires
    ca_aujourdhui = serializers.DecimalField(max_digits=12, decimal_places=2)
    ca_semaine = serializers.DecimalField(max_digits=12, decimal_places=2)
    ca_mois = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Temps
    temps_moyen_tournee = serializers.FloatField()  # En heures
    temps_moyen_livraison = serializers.FloatField()  # En minutes
    
    # Distance
    distance_moyenne_parcourue = serializers.FloatField()  # En km
    
    # Performance
    livraisons_par_agent_par_jour = serializers.FloatField()
    quantite_moyenne_par_livraison = serializers.FloatField()