from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import LigneLivraison, Livraison
from products.serializers import ProduitListSerializer
from products.models import Produit
from authentication.models import Agent, Client
from tours.models import Tournee
import logging

logger = logging.getLogger('deliveries')


class LigneLivraisonSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de livraison"""
    produit_detail = ProduitListSerializer(source='produit', read_only=True)
    
    class Meta:
        model = LigneLivraison
        fields = [
            'id', 'produit', 'produit_detail', 'quantite',
            'prix_unitaire', 'montant', 'created_at'
        ]
        read_only_fields = ['id', 'montant', 'created_at']


class LigneLivraisonCreateSerializer(serializers.Serializer):
    """Serializer pour créer une ligne de livraison"""
    produit_id = serializers.IntegerField()
    quantite = serializers.IntegerField(min_value=1)
    
    def validate_produit_id(self, value):
        """Vérifier que le produit existe et est actif"""
        try:
            produit = Produit.objects.get(id=value)
            if not produit.actif:
                raise serializers.ValidationError("Ce produit n'est plus disponible")
        except Produit.DoesNotExist:
            raise serializers.ValidationError("Produit non trouvé")
        return value


class LivraisonListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les livraisons"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Livraison
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom',
            'client', 'client_code', 'client_nom',
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
    
    tournee_id = serializers.IntegerField(source='tournee.id', read_only=True, allow_null=True)
    distance_client = serializers.FloatField(read_only=True)
    
    lignes = LigneLivraisonSerializer(many=True, read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Livraison
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom', 'agent_telephone',
            'client', 'client_code', 'client_nom', 'client_responsable',
            'client_telephone', 'client_adresse',
            'tournee', 'tournee_id',
            'latitude', 'longitude', 'distance_client',
            'lignes', 'quantite_totale', 'montant_total',
            'date_livraison', 'heure_livraison', 'duree_livraison',
            'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LivraisonCreateSerializer(serializers.Serializer):
    """
    Serializer pour créer une livraison avec lignes de produits
    
    Peut créer un nouveau client OU utiliser un client existant
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
        """Création de la livraison avec lignes"""
        request = self.context.get('request')
        is_admin = self.context.get('is_admin', False)
        
        # ÉTAPE 1: Récupérer l'agent connecté
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            # Si c'est un admin, on ne peut pas créer de livraison
            # (il faudrait spécifier quel agent)
            if is_admin:
                raise serializers.ValidationError(
                    "En tant qu'admin, vous devez spécifier un agent_id"
                )
            raise serializers.ValidationError("Agent non trouvé")
        
        # ÉTAPE 2: Vérifier que l'agent est en tournée (SAUF si admin)
        if not is_admin:
            if agent.statut != 'en_tournee':
                raise serializers.ValidationError(
                    "Vous devez être en tournée pour enregistrer une livraison"
                )
        
        # ÉTAPE 3: Récupérer la tournée en cours (SAUF si admin)
        tournee = None
        if not is_admin:
            tournee = Tournee.objects.filter(
                agent=agent,
                heure_fin__isnull=True
            ).first()
            
            if not tournee:
                raise serializers.ValidationError(
                    "Aucune tournée en cours trouvée. Veuillez démarrer une tournée."
                )        
        # ÉTAPE 4: Gérer le client (existant ou nouveau)
        client_id = validated_data.get('client_id')
        
        if client_id:
            # Client existant
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                raise serializers.ValidationError({"client_id": "Client non trouvé"})
        else:
            # Créer un nouveau client
            # Les coordonnées GPS du nouveau client = position de l'agent lors de la livraison
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
        
        # ÉTAPE 5: Valider la distance (≤ 2 mètres)
        if client.latitude and client.longitude:
            distance = Livraison.calculer_distance(
                validated_data['latitude'],
                validated_data['longitude'],
                client.latitude,
                client.longitude
            )
            logger.info(f"Distance calculée : {distance:.2f} mètres")
            
            if distance > 2:
                raise serializers.ValidationError({
                    'latitude': f"Vous êtes trop loin du client ({distance:.2f}m). Vous devez être à moins de 2 mètres pour valider la livraison."
                })
        else:
            # Client sans GPS : REFUSER la livraison
            raise serializers.ValidationError({
                'client_id': "Ce client n'a pas de coordonnées GPS enregistrées. Impossible de valider la livraison."
            })
        
        # ÉTAPE 6: Créer la livraison
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
        
        # ÉTAPE 7: Créer les lignes de livraison
        lignes_data = validated_data.pop('lignes', [])
        quantite_totale = 0
        montant_total = Decimal('0')
        
        for ligne_data in lignes_data:
            produit = Produit.objects.get(id=ligne_data['produit_id'])
            
            ligne = LigneLivraison.objects.create(
                livraison=livraison,
                produit=produit,
                quantite=ligne_data['quantite'],
                prix_unitaire=produit.prix_unitaire
            )
            
            quantite_totale += ligne.quantite
            montant_total += ligne.montant
        
        # ÉTAPE 8: Mettre à jour les totaux (optionnel car calculés via propriétés)
        livraison.quantite_livree = quantite_totale
        livraison.montant_percu = montant_total
        livraison.save()
        
        logger.info(
            f"Livraison créée : #{livraison.id} - "
            f"Agent {agent.numero_identification} → Client {client.code_client} - "
            f"{len(lignes_data)} produit(s), {quantite_totale} unités, {montant_total} FCFA"
        )
        
        return livraison