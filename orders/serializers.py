from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import Commande, Notification, LigneCommande
from products.models import Produit
from products.serializers import ProduitListSerializer
from authentication.models import Agent, Client
import logging

logger = logging.getLogger('orders')


class LigneCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de commande"""
    produit_detail = ProduitListSerializer(source='produit', read_only=True)
    
    class Meta:
        model = LigneCommande
        fields = [
            'id', 'produit', 'produit_detail', 'quantite',
            'prix_unitaire', 'montant', 'created_at'
        ]
        read_only_fields = ['id', 'montant', 'created_at']


class LigneCommandeCreateSerializer(serializers.Serializer):
    """Serializer pour créer une ligne de commande"""
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


class CommandeCreateSerializer(serializers.Serializer):
    """Serializer pour créer une commande avec lignes de produits"""
    
    adresse_livraison = serializers.CharField()
    lignes = LigneCommandeCreateSerializer(many=True)
    
    def validate(self, data):
        """Validations supplémentaires"""
        # Vérifier qu'il y a au moins une ligne de commande
        if not data.get('lignes') or len(data.get('lignes')) == 0:
            raise serializers.ValidationError({
                'lignes': "Vous devez commander au moins un produit."
            })
        return data
    
    def create(self, validated_data):
        """Création de la commande avec lignes"""
        request = self.context.get('request')
        
        # Récupérer le client
        try:
            client = Client.objects.get(email=request.user.email)
        except Client.DoesNotExist:
            raise serializers.ValidationError("Client non trouvé")
        
        # Extraire les lignes
        lignes_data = validated_data.pop('lignes', [])
        
        # Créer la commande
        commande = Commande.objects.create(
            client=client,
            statut='en_attente',
            **validated_data
        )
        
        # Créer les lignes de commande
        quantite_totale = 0
        montant_total = Decimal('0')
        
        for ligne_data in lignes_data:
            produit = Produit.objects.get(id=ligne_data['produit_id'])
            
            ligne = LigneCommande.objects.create(
                commande=commande,
                produit=produit,
                quantite=ligne_data['quantite'],
                prix_unitaire=produit.prix_unitaire
            )
            
            quantite_totale += ligne.quantite
            montant_total += ligne.montant
        
        # Mettre à jour le total (optionnel car calculé via propriété)
        commande.quantite_demandee = quantite_totale
        commande.save()
        
        # Créer une notification pour les admins
        Notification.objects.create(
            type='nouvelle_commande',
            client=client,
            commande=commande,
            titre='Nouvelle commande',
            message=(
                f"Le client {client.nom_point_vente} ({client.code_client}) "
                f"a passé une nouvelle commande de {quantite_totale} unités "
                f"pour un montant de {montant_total} FCFA."
            )
        )
        
        logger.info(
            f"Commande créée : #{commande.id} - Client {client.code_client} - "
            f"{len(lignes_data)} produit(s), {quantite_totale} unités, {montant_total} FCFA"
        )
        
        return commande


class CommandeListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les commandes"""
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    agent_nom = serializers.CharField(
        source='agent.nom',
        read_only=True,
        allow_null=True
    )
    est_assignee = serializers.BooleanField(read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_code', 'client_nom',
            'agent', 'agent_numero', 'agent_nom', 'est_assignee',
            'quantite_totale', 'montant_total',
            'statut', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CommandeDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une commande"""
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    client_responsable = serializers.CharField(source='client.nom_responsable', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_adresse = serializers.CharField(source='client.adresse', read_only=True)
    
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    agent_nom = serializers.CharField(
        source='agent.nom',
        read_only=True,
        allow_null=True
    )
    agent_prenom = serializers.CharField(
        source='agent.prenom',
        read_only=True,
        allow_null=True
    )
    agent_telephone = serializers.CharField(
        source='agent.telephone',
        read_only=True,
        allow_null=True
    )
    
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    est_assignee = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_code', 'client_nom', 'client_responsable',
            'client_telephone', 'client_adresse',
            'agent', 'agent_numero', 'agent_nom', 'agent_prenom', 'agent_telephone',
            'lignes', 'quantite_totale', 'montant_total',
            'adresse_livraison',
            'statut', 'est_assignee',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommandeAssignSerializer(serializers.Serializer):
    """Serializer pour assigner une commande à un agent"""
    agent_id = serializers.IntegerField()
    
    def validate_agent_id(self, value):
        """Vérifier que l'agent existe et est actif"""
        try:
            agent = Agent.objects.get(id=value)
            if agent.statut == 'inactif':
                raise serializers.ValidationError("Cet agent est inactif")
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Agent non trouvé")
        return value


class CommandeStatusSerializer(serializers.Serializer):
    """Serializer pour changer le statut d'une commande"""
    statut = serializers.ChoiceField(
        choices=['en_attente', 'acceptee', 'en_cours', 'livree', 'annulee']
    )


class CommandeUpdateSerializer(serializers.Serializer):
    """Serializer pour modifier une commande (client uniquement si en_attente)"""
    adresse_livraison = serializers.CharField(required=False)


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    client_code = serializers.CharField(
        source='client.code_client',
        read_only=True,
        allow_null=True
    )
    commande_id = serializers.IntegerField(
        source='commande.id',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'titre', 'message', 'lue',
            'agent', 'agent_numero',
            'client', 'client_code',
            'commande', 'commande_id',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']