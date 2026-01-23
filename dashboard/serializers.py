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


class DashboardAgentSerializer(serializers.Serializer):
    """Serializer pour le dashboard agent"""
    agent_id = serializers.IntegerField()
    agent_numero = serializers.CharField()
    agent_nom = serializers.CharField()
    
    # Statistiques du jour
    livraisons_aujourdhui = serializers.IntegerField()
    quantite_aujourdhui = serializers.IntegerField()
    montant_aujourdhui = serializers.DecimalField(max_digits=10, decimal_places=2)
    tournee_en_cours = serializers.BooleanField()
    duree_tournee_actuelle = serializers.CharField(allow_null=True)
    
    # Statistiques de la semaine
    livraisons_semaine = serializers.IntegerField()
    quantite_semaine = serializers.IntegerField()
    montant_semaine = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Statistiques du mois
    livraisons_mois = serializers.IntegerField()
    quantite_mois = serializers.IntegerField()
    montant_mois = serializers.DecimalField(max_digits=10, decimal_places=2)


class StatistiquesPeriodiqueSerializer(serializers.Serializer):
    """Serializer pour les statistiques sur une période"""
    periode = serializers.CharField()  # jour, semaine, mois
    date_debut = serializers.DateField()
    date_fin = serializers.DateField()
    
    # Globales
    total_livraisons = serializers.IntegerField()
    total_quantite = serializers.IntegerField()
    total_montant = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Moyennes
    moyenne_livraisons_par_jour = serializers.FloatField()
    moyenne_quantite_par_livraison = serializers.FloatField()
    montant_moyen_par_livraison = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Par agent
    nombre_agents_actifs = serializers.IntegerField()
    moyenne_livraisons_par_agent = serializers.FloatField()


class PerformanceAgentSerializer(serializers.Serializer):
    """Serializer pour la performance d'un agent"""
    agent_id = serializers.IntegerField()
    agent_numero = serializers.CharField()
    agent_nom = serializers.CharField()
    
    total_livraisons = serializers.IntegerField()
    total_quantite = serializers.IntegerField()
    total_montant = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    moyenne_livraisons_par_jour = serializers.FloatField()
    montant_moyen_par_livraison = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    classement = serializers.IntegerField(allow_null=True)


class ZoneLivraisonSerializer(serializers.Serializer):
    """Serializer pour les zones de livraison"""
    zone = serializers.CharField()  # Nom de la zone ou coordonnées
    nombre_livraisons = serializers.IntegerField()
    quantite_totale = serializers.IntegerField()
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    pourcentage_total = serializers.FloatField()


class HeurePointeSerializer(serializers.Serializer):
    """Serializer pour les heures de pointe"""
    heure = serializers.IntegerField()  # 0-23
    nombre_livraisons = serializers.IntegerField()
    quantite_totale = serializers.IntegerField()


class EvolutionTemporelleSerializer(serializers.Serializer):
    """Serializer pour l'évolution dans le temps"""
    date = serializers.DateField()
    livraisons = serializers.IntegerField()
    quantite = serializers.IntegerField()
    montant = serializers.DecimalField(max_digits=10, decimal_places=2)


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