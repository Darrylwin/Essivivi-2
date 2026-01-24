from rest_framework import serializers
from django.utils import timezone
from .models import LigneLivraison, Livraison
from products.serializers import ProduitListSerializer
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
    
    tournee_id = serializers.IntegerField(source='tournee.id', read_only=True)
    distance_client = serializers.FloatField(read_only=True)
    
    # NOUVEAU : Inclure les lignes de livraison
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
    """Serializer pour créer une livraison"""
    
    # Client existant OU nouveau client
    client_id = serializers.IntegerField(required=False, allow_null=True)
    
    # Nouveau client (si client_id n'est pas fourni)
    nom_point_vente = serializers.CharField(max_length=200, required=False)
    nom_responsable = serializers.CharField(max_length=100, required=False)
    telephone = serializers.CharField(max_length=20, required=False)
    email = serializers.EmailField(required=False, allow_null=True)
    adresse = serializers.CharField(required=False)
    type_client = serializers.ChoiceField(
        choices=['detaillant', 'grossiste', 'institution'],
        required=False
    )

    lignes = LigneLivraisonCreateSerializer(many=True)
    
    # Coordonnées GPS de la livraison
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
                        field: f"Ce champ est obligatoire pour créer un nouveau client."
                    })
        
        return data
    
    def create(self, validated_data):
        """Création de la livraison"""
        lignes = LigneLivraisonCreateSerializer(many=True)
        # Coordonnées GPS de la livraison
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
                            field: f"Ce champ est obligatoire pour créer un nouveau client."
                        })
            return data

        def create(self, validated_data):
            """Création de la livraison"""
            request = self.context.get('request')
            # Récupérer l'agent
            try:
                agent = Agent.objects.get(email=request.user.email)
            except Agent.DoesNotExist:
                raise serializers.ValidationError("Agent non trouvé")
            # Vérifier que l'agent est en tournée
            if agent.statut != 'en_tournee':
                raise serializers.ValidationError(
                    "Vous devez être en tournée pour enregistrer une livraison"
                )
            # Récupérer la tournée en cours
            tournee = Tournee.objects.filter(
                agent=agent,
                heure_fin__isnull=True
            ).first()
            if not tournee:
                raise serializers.ValidationError(
                    "Aucune tournée en cours trouvée"
                )
            # Gérer le client
            client_id = validated_data.get('client_id')
            if client_id:
                # Client existant
                try:
                    client = Client.objects.get(id=client_id)
                except Client.DoesNotExist:
                    raise serializers.ValidationError("Client non trouvé")
            else:
                # Créer un nouveau client
                client = Client.objects.create(
                    nom_point_vente=validated_data['nom_point_vente'],
                    nom_responsable=validated_data['nom_responsable'],
                    telephone=validated_data['telephone'],
                    email=validated_data.get('email'),
                    adresse=validated_data['adresse'],
                    latitude=validated_data['latitude'],
                    longitude=validated_data['longitude'],
                    type_client=validated_data['type_client'],
                    statut='actif'
                )
                logger.info(f"Nouveau client créé : {client.code_client}")
            # Valider la distance (≤ 2 mètres)
            if client.latitude and client.longitude:
                distance = Livraison.calculer_distance(
                    validated_data['latitude'],
                    validated_data['longitude'],
                    client.latitude,
                    client.longitude
                )
                logger.info(f"Distance calculée : {distance:.2f} mètres")
                if distance > 2:
                    raise serializers.ValidationError(
                        f"Vous êtes trop loin du client ({distance:.2f}m). "
                        f"Vous devez être à moins de 2 mètres."
                    )
            # Créer la livraison (quantite_livree et montant_percu seront calculés)
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
            # Créer les lignes de livraison
            lignes_data = validated_data.pop('lignes', [])
            from products.models import Produit
            quantite_livree = 0
            montant_percu = 0
            for ligne_data in lignes_data:
                produit = Produit.objects.get(id=ligne_data['produit_id'])
                ligne = LigneLivraison.objects.create(
                    livraison=livraison,
                    produit=produit,
                    quantite=ligne_data['quantite'],
                    prix_unitaire=produit.prix_unitaire,
                )
                quantite_livree += ligne.quantite
                montant_percu += ligne.quantite * float(produit.prix_unitaire)
            # Mettre à jour la livraison avec les totaux
            livraison.quantite_livree = quantite_livree
            livraison.montant_percu = montant_percu
            livraison.save()
            logger.info(f"Livraison créée avec {len(lignes_data)} produits")
            logger.info(
                f"Livraison créée : #{livraison.id} - "
                f"Agent {agent.numero_identification} → Client {client.code_client}"
            )
            return livraison
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    agent_telephone = serializers.CharField(source='agent.telephone', read_only=True)
    
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    client_responsable = serializers.CharField(source='client.nom_responsable', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_adresse = serializers.CharField(source='client.adresse', read_only=True)
    
    tournee_id = serializers.IntegerField(source='tournee.id', read_only=True)
    distance_client = serializers.FloatField(read_only=True)

    lignes = LigneLivraisonSerializer(many=True, read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Livraison
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom', 'agent_telephone',
            'client', 'client_code', 'client_nom', 'client_responsable',
            'client_telephone', 'client_adresse',
            'tournee', 'tournee_id',
            'latitude', 'longitude', 'distance_client',
            'quantite_livree', 'montant_percu',
            'date_livraison', 'heure_livraison', 'duree_livraison',
            'statut', 'created_at', 'updated_at', 'lignes',
            'montant_total',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']