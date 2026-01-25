from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import LigneLivraison, Livraison
from products.serializers import ProduitListSerializer
from products.models import Produit
from authentication.models import Agent, Client
from tours.models import Tournee
from orders.models import Commande, LigneCommande
import logging

logger = logging.getLogger('deliveries')


class LigneLivraisonSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de livraison"""
    produit_detail = ProduitListSerializer(source='produit', read_only=True)
    ligne_commande_id = serializers.IntegerField(source='ligne_commande.id', read_only=True, allow_null=True)
    
    class Meta:
        model = LigneLivraison
        fields = [
            'id', 'produit', 'produit_detail', 'ligne_commande', 'ligne_commande_id',
            'quantite', 'prix_unitaire', 'montant', 'created_at'
        ]
        read_only_fields = ['id', 'montant', 'created_at']


class LigneLivraisonCreateSerializer(serializers.Serializer):
    """Serializer pour créer une ligne de livraison"""
    produit_id = serializers.IntegerField()
    quantite = serializers.IntegerField(min_value=1)
    ligne_commande_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID de la ligne de commande correspondante (si livraison pour commande)"
    )
    
    def validate_produit_id(self, value):
        """Vérifier que le produit existe et est actif"""
        try:
            produit = Produit.objects.get(id=value)
            if not produit.actif:
                raise serializers.ValidationError("Ce produit n'est plus disponible")
        except Produit.DoesNotExist:
            raise serializers.ValidationError("Produit non trouvé")
        return value
    
    def validate_ligne_commande_id(self, value):
        """Vérifier que la ligne de commande existe"""
        if value:
            try:
                LigneCommande.objects.get(id=value)
            except LigneCommande.DoesNotExist:
                raise serializers.ValidationError("Ligne de commande non trouvée")
        return value


class LivraisonListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les livraisons"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    commande_id = serializers.IntegerField(source='commande.id', read_only=True, allow_null=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Livraison
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom',
            'client', 'client_code', 'client_nom',
            'commande', 'commande_id',
            'quantite_totale', 'montant_total',
            'date_livraison', 'heure_livraison', 'statut',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LivraisonDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une livraison"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    agent_telephone = serializers.CharField(source='agent.telephone', read_only=True)
    
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    client_responsable = serializers.CharField(source='client.nom_responsable', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_adresse = serializers.CharField(source='client.adresse', read_only=True)
    
    commande_id = serializers.IntegerField(source='commande.id', read_only=True, allow_null=True)
    tournee_id = serializers.IntegerField(source='tournee.id', read_only=True, allow_null=True)
    distance_client = serializers.FloatField(read_only=True)
    distance_commande = serializers.FloatField(read_only=True)
    
    lignes = LigneLivraisonSerializer(many=True, read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Livraison
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom', 'agent_telephone',
            'client', 'client_code', 'client_nom', 'client_responsable',
            'client_telephone', 'client_adresse',
            'commande', 'commande_id',
            'tournee', 'tournee_id',
            'latitude', 'longitude', 'distance_client', 'distance_commande',
            'lignes', 'quantite_totale', 'montant_total',
            'date_livraison', 'heure_livraison', 'duree_livraison',
            'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LivraisonCreateForCommandeSerializer(serializers.Serializer):
    """
    Serializer pour créer une livraison POUR UNE COMMANDE EXISTANTE
    (Scénario principal : agent livrant une commande assignée)
    """
    
    commande_id = serializers.IntegerField(
        required=True,
        help_text="ID de la commande à livrer"
    )
    
    # Coordonnées GPS de la livraison (position de l'agent)
    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=8,
        required=True,
        min_value=-90,
        max_value=90,
        help_text="Latitude GPS de l'agent au moment de la livraison"
    )
    longitude = serializers.DecimalField(
        max_digits=11,
        decimal_places=8,
        required=True,
        min_value=-180,
        max_value=180,
        help_text="Longitude GPS de l'agent au moment de la livraison"
    )
    
    # Lignes de livraison (doivent correspondre aux lignes de commande)
    lignes = LigneLivraisonCreateSerializer(
        many=True,
        required=False,
        help_text="Lignes de livraison. Si non fourni, utilise les lignes de la commande"
    )
    
    def validate(self, data):
        """Validation personnalisée pour la livraison de commande"""
        commande_id = data.get('commande_id')
        
        # Vérifier que la commande existe
        try:
            commande = Commande.objects.get(id=commande_id)
            data['_commande'] = commande  # Stocker pour usage ultérieur
        except Commande.DoesNotExist:
            raise serializers.ValidationError({
                'commande_id': "Commande non trouvée"
            })
        
        # Vérifier que la commande est assignée à un agent
        if not commande.agent:
            raise serializers.ValidationError({
                'commande_id': "Cette commande n'est pas assignée à un agent"
            })
        
        # Vérifier le statut de la commande
        if commande.statut not in ['acceptee', 'en_cours']:
            raise serializers.ValidationError({
                'commande_id': f"Cette commande ne peut pas être livrée dans son statut actuel ({commande.statut})"
            })
        
        # Vérifier les coordonnées GPS
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not latitude or not longitude:
            raise serializers.ValidationError({
                'latitude': "Les coordonnées GPS sont requises",
                'longitude': "Les coordonnées GPS sont requises"
            })
        
        # Valider la distance avec le point de livraison de la commande
        distance = Livraison.calculer_distance(
            float(latitude),
            float(longitude),
            float(commande.latitude_livraison),
            float(commande.longitude_livraison)
        )
        
        if distance > 2:
            raise serializers.ValidationError({
                'latitude': f"Vous êtes trop loin du point de livraison ({distance:.2f}m). Maximum 2m autorisé.",
                'longitude': f"Distance du point de livraison : {distance:.2f}m"
            })
        
        logger.info(f"Distance validation OK : {distance:.2f}m")
        
        # Valider les lignes de livraison
        lignes_data = data.get('lignes', [])
        if lignes_data:
            # Valider que les produits correspondent à la commande
            commande_produit_ids = list(commande.lignes.values_list('produit_id', flat=True))
            livraison_produit_ids = [ligne['produit_id'] for ligne in lignes_data]
            
            # Vérifier que tous les produits livrés sont dans la commande
            for produit_id in livraison_produit_ids:
                if produit_id not in commande_produit_ids:
                    raise serializers.ValidationError({
                        'lignes': f"Le produit {produit_id} n'est pas dans la commande #{commande.id}"
                    })
        
        return data
    
    def create(self, validated_data):
        """Création de la livraison pour une commande"""
        request = self.context.get('request')
        
        # ÉTAPE 1: Récupérer l'agent connecté
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Seuls les agents peuvent effectuer des livraisons")
        
        # ÉTAPE 2: Vérifier que l'agent est en tournée
        if agent.statut != 'en_tournee':
            raise serializers.ValidationError(
                "Vous devez être en tournée pour effectuer une livraison"
            )
        
        # ÉTAPE 3: Récupérer la commande
        commande = validated_data['_commande']
        
        # ÉTAPE 4: Vérifier que l'agent est bien celui assigné à la commande
        if commande.agent != agent:
            raise serializers.ValidationError({
                'commande_id': f"Cette commande est assignée à l'agent {commande.agent.numero_identification}, pas à vous"
            })
        
        # ÉTAPE 5: Récupérer la tournée en cours de l'agent
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        if not tournee:
            raise serializers.ValidationError(
                "Aucune tournée en cours trouvée. Veuillez démarrer une tournée."
            )
        
        # ÉTAPE 6: Créer la livraison
        now = timezone.now()
        livraison = Livraison.objects.create(
            agent=agent,
            client=commande.client,
            commande=commande,
            tournee=tournee,
            latitude=validated_data['latitude'],
            longitude=validated_data['longitude'],
            date_livraison=now.date(),
            heure_livraison=now.time(),
            statut='livree'
        )
        
        # ÉTAPE 7: Créer les lignes de livraison
        lignes_data = validated_data.get('lignes', [])
        
        if not lignes_data:
            # Si pas de lignes spécifiées, utiliser toutes les lignes de la commande
            for ligne_commande in commande.lignes.all():
                LigneLivraison.objects.create(
                    livraison=livraison,
                    ligne_commande=ligne_commande,
                    produit=ligne_commande.produit,
                    quantite=ligne_commande.quantite,
                    prix_unitaire=ligne_commande.prix_unitaire
                )
        else:
            # Si lignes spécifiées, les créer avec validation
            for ligne_data in lignes_data:
                ligne_commande = None
                if ligne_data.get('ligne_commande_id'):
                    ligne_commande = LigneCommande.objects.get(id=ligne_data['ligne_commande_id'])
                
                produit = Produit.objects.get(id=ligne_data['produit_id'])
                
                LigneLivraison.objects.create(
                    livraison=livraison,
                    ligne_commande=ligne_commande,
                    produit=produit,
                    quantite=ligne_data['quantite'],
                    prix_unitaire=produit.prix_unitaire
                )
        
        # ÉTAPE 8: Calculer et mettre à jour les totaux
        quantite_totale = livraison.quantite_totale
        montant_total = livraison.montant_total
        
        livraison.quantite_livree = quantite_totale
        livraison.montant_percu = montant_total
        livraison.save()
        
        # ÉTAPE 9: Mettre à jour le statut de la commande
        commande.statut = 'livree'
        commande.save()
        
        # ÉTAPE 10: Créer une notification pour le client
        from orders.models import Notification
        Notification.objects.create(
            type='livraison_terminee',
            client=commande.client,
            commande=commande,
            titre='Commande livrée',
            message=f"Votre commande #{commande.id} a été livrée avec succès par l'agent {agent.numero_identification}"
        )
        
        logger.info(
            f"Livraison pour commande créée : #{livraison.id} - "
            f"Commande #{commande.id} - "
            f"Agent {agent.numero_identification} → Client {commande.client.code_client} - "
            f"{quantite_totale} unités, {montant_total} FCFA"
        )
        
        return livraison


class LivraisonCreateSansCommandeSerializer(serializers.Serializer):
    """
    Serializer pour créer une livraison SANS COMMANDE
    (Scénario secondaire : vente directe à un client sans commande préalable)
    """
    
    # Client existant OU nouveau client
    client_id = serializers.IntegerField(required=False, allow_null=True)
    
    # Champs pour créer un nouveau client (si client_id non fourni)
    nom_point_vente = serializers.CharField(max_length=200, required=False)
    nom_responsable = serializers.CharField(max_length=100, required=False)
    telephone = serializers.CharField(max_length=20, required=False)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    adresse = serializers.CharField(required=False)
    type_client = serializers.ChoiceField(
        choices=['detaillant', 'grossiste', 'institution'],
        required=False
    )
    
    # Lignes de livraison (produits livrés)
    lignes = LigneLivraisonCreateSerializer(many=True)
    
    # Coordonnées GPS de la livraison (position de l'agent)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8)
    
    def validate(self, data):
        """Validation personnalisée"""
        client_id = data.get('client_id')
        
        # Si client_id n'est pas fourni, les champs nouveau client sont obligatoires
        if not client_id:
            required_fields = [
                'nom_point_vente', 'nom_responsable', 'telephone',
                'adresse', 'type_client'
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: "Ce champ est obligatoire pour créer un nouveau client."
                    })
        
        # Vérifier qu'il y a au moins une ligne de livraison
        if not data.get('lignes') or len(data.get('lignes')) == 0:
            raise serializers.ValidationError({
                'lignes': "Vous devez livrer au moins un produit."
            })
        
        return data
    
    def create(self, validated_data):
        """Création de la livraison sans commande"""
        request = self.context.get('request')
        
        # ÉTAPE 1: Récupérer l'agent connecté
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Seuls les agents peuvent effectuer des livraisons")
        
        # ÉTAPE 2: Vérifier que l'agent est en tournée
        if agent.statut != 'en_tournee':
            raise serializers.ValidationError(
                "Vous devez être en tournée pour effectuer une livraison"
            )
        
        # ÉTAPE 3: Récupérer la tournée en cours
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        if not tournee:
            raise serializers.ValidationError(
                "Aucune tournée en cours trouvée. Veuillez démarrer une tournée."
            )
        
        # ÉTAPE 4: Gérer le client
        client_id = validated_data.get('client_id')
        
        if client_id:
            # Client existant
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                raise serializers.ValidationError({"client_id": "Client non trouvé"})
        else:
            # Créer un nouveau client
            client = Client.objects.create(
                nom_point_vente=validated_data['nom_point_vente'],
                nom_responsable=validated_data['nom_responsable'],
                telephone=validated_data['telephone'],
                email=validated_data.get('email') or '',
                adresse=validated_data['adresse'],
                latitude=validated_data['latitude'],
                longitude=validated_data['longitude'],
                type_client=validated_data['type_client'],
                statut='actif'
            )
            logger.info(f"Nouveau client créé lors de la livraison : {client.code_client}")
        
        # ÉTAPE 5: Créer la livraison (sans commande)
        now = timezone.now()
        livraison = Livraison.objects.create(
            agent=agent,
            client=client,
            tournee=tournee,
            latitude=validated_data['latitude'],
            longitude=validated_data['longitude'],
            date_livraison=now.date(),
            heure_livraison=now.time(),
            statut='livree'
        )
        
        # ÉTAPE 6: Créer les lignes de livraison (sans lien avec commande)
        lignes_data = validated_data['lignes']
        
        for ligne_data in lignes_data:
            produit = Produit.objects.get(id=ligne_data['produit_id'])
            
            LigneLivraison.objects.create(
                livraison=livraison,
                produit=produit,
                quantite=ligne_data['quantite'],
                prix_unitaire=produit.prix_unitaire
            )
        
        # ÉTAPE 7: Mettre à jour les totaux
        quantite_totale = livraison.quantite_totale
        montant_total = livraison.montant_total
        
        livraison.quantite_livree = quantite_totale
        livraison.montant_percu = montant_total
        livraison.save()
        
        logger.info(
            f"Livraison directe créée : #{livraison.id} - "
            f"Agent {agent.numero_identification} → Client {client.code_client} - "
            f"{len(lignes_data)} produit(s), {quantite_totale} unités, {montant_total} FCFA"
        )
        
        return livraison