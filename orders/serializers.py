from rest_framework import serializers
from decimal import Decimal
from .models import Commande, Notification, LigneCommande
from products.models import Produit
from products.serializers import ProduitListSerializer
from authentication.models import Agent, Client
import logging

logger = logging.getLogger('orders')


# ==================== LIGNES DE COMMANDE ====================

class LigneCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les lignes de commande"""
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
    produit_id = serializers.IntegerField(min_value=1)
    quantite = serializers.IntegerField(min_value=1)
    
    def validate_produit_id(self, value):
        """Vérifier que le produit existe et est actif"""
        try:
            produit = Produit.objects.get(id=value, actif=True)
        except Produit.DoesNotExist:
            raise serializers.ValidationError(
                "Produit non trouvé ou inactif"
            )
        return value


# ==================== COMMANDES ====================

class CommandeCreateSerializer(serializers.Serializer):
    """Serializer pour créer une commande (Client)"""
    latitude_livraison = serializers.DecimalField(
        max_digits=10,
        decimal_places=8,
        required=True,
        min_value=-90,
        max_value=90,
        help_text="Latitude du point de livraison (-90 à 90)"
    )
    longitude_livraison = serializers.DecimalField(
        max_digits=11,
        decimal_places=8,
        required=True,
        min_value=-180,
        max_value=180,
        help_text="Longitude du point de livraison (-180 à 180)"
    )
    utiliser_coordonnees_client = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Si True, utilise les coordonnées GPS du client au lieu de celles fournies"
    )
    lignes = LigneCommandeCreateSerializer(
        many=True,
        help_text="Liste des produits à commander"
    )
    
    def validate_lignes(self, value):
        """Vérifier qu'il y a au moins une ligne"""
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "Vous devez commander au moins un produit"
            )
        
        # Vérifier qu'il n'y a pas de doublons de produits
        produit_ids = [ligne['produit_id'] for ligne in value]
        if len(produit_ids) != len(set(produit_ids)):
            raise serializers.ValidationError(
                "Vous ne pouvez pas commander le même produit plusieurs fois. "
                "Augmentez plutôt la quantité."
            )
        
        return value
    
    def validate(self, data):
        """Validation globale des coordonnées"""
        utiliser_coordonnees_client = data.get('utiliser_coordonnees_client', False)
        
        if utiliser_coordonnees_client:
            # Si on utilise les coordonnées du client, on ignore celles fournies
            data.pop('latitude_livraison', None)
            data.pop('longitude_livraison', None)
        else:
            # Vérifier que les coordonnées sont fournies
            if 'latitude_livraison' not in data or 'longitude_livraison' not in data:
                raise serializers.ValidationError(
                    "Les coordonnées de livraison sont requises"
                )
        
        return data
    
    def create(self, validated_data):
        """Créer la commande avec ses lignes"""
        request = self.context.get('request')
        
        # Récupérer le client
        try:
            client = Client.objects.get(email=request.user.email)
        except Client.DoesNotExist:
            raise serializers.ValidationError("Client non trouvé")
        
        # Extraire les lignes
        lignes_data = validated_data.pop('lignes')
        utiliser_coordonnees_client = validated_data.pop('utiliser_coordonnees_client', False)
        
        # Déterminer les coordonnées de livraison
        if utiliser_coordonnees_client:
            # Utiliser les coordonnées du client
            latitude_livraison = client.latitude
            longitude_livraison = client.longitude
        else:
            # Utiliser les coordonnées fournies
            latitude_livraison = validated_data.pop('latitude_livraison')
            longitude_livraison = validated_data.pop('longitude_livraison')
        
        # Créer la commande
        commande = Commande.objects.create(
            client=client,
            statut='en_attente',
            latitude_livraison=latitude_livraison,
            longitude_livraison=longitude_livraison,
        )
        
        # Créer les lignes
        quantite_totale = 0
        montant_total = Decimal('0.00')
        
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
        
        # Mettre à jour la quantité totale
        commande.quantite_demandee = quantite_totale
        commande.save()
        
        # Créer notification pour admin
        Notification.objects.create(
            type='nouvelle_commande',
            client=client,
            commande=commande,
            titre='Nouvelle commande',
            message=(
                f"{client.nom_point_vente} ({client.code_client}) a passé une commande "
                f"de {quantite_totale} unités pour {montant_total} FCFA. "
                f"Localisation: {commande.latitude_livraison}, {commande.longitude_livraison}"
            )
        )
        
        logger.info(
            f"Commande créée : #{commande.id} - {client.code_client} - "
            f"{len(lignes_data)} produit(s), {quantite_totale} unités, {montant_total} FCFA - "
            f"GPS: {commande.latitude_livraison}, {commande.longitude_livraison}"
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
    agent_nom = serializers.SerializerMethodField()
    est_assignee = serializers.BooleanField(read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    montant_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_code', 'client_nom',
            'agent', 'agent_numero', 'agent_nom', 'est_assignee',
            'quantite_totale', 'montant_total',
            'latitude_livraison', 'longitude_livraison',
            'statut', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_agent_nom(self, obj):
        """Retourne le nom complet de l'agent"""
        if obj.agent:
            return f"{obj.agent.nom} {obj.agent.prenom}"
        return None


class CommandeDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une commande"""
    # Infos client
    client_code = serializers.CharField(source='client.code_client', read_only=True)
    client_nom = serializers.CharField(source='client.nom_point_vente', read_only=True)
    client_responsable = serializers.CharField(source='client.nom_responsable', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_latitude = serializers.DecimalField(source='client.latitude', read_only=True, max_digits=10, decimal_places=8)
    client_longitude = serializers.DecimalField(source='client.longitude', read_only=True, max_digits=11, decimal_places=8)
    
    # Infos agent
    agent_numero = serializers.CharField(
        source='agent.numero_identification',
        read_only=True,
        allow_null=True
    )
    agent_nom_complet = serializers.SerializerMethodField()
    agent_telephone = serializers.CharField(
        source='agent.telephone',
        read_only=True,
        allow_null=True
    )
    
    # Lignes et totaux
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    quantite_totale = serializers.IntegerField(read_only=True)
    montant_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    est_assignee = serializers.BooleanField(read_only=True)
    
    # Distance entre client et point de livraison
    distance_client_livraison = serializers.SerializerMethodField()
    
    class Meta:
        model = Commande
        fields = [
            'id',
            # Client
            'client', 'client_code', 'client_nom', 'client_responsable',
            'client_telephone', 'client_latitude', 'client_longitude',
            # Agent
            'agent', 'agent_numero', 'agent_nom_complet', 'agent_telephone',
            # Commande
            'lignes', 'quantite_totale', 'montant_total',
            'latitude_livraison', 'longitude_livraison',
            'statut', 'est_assignee', 'distance_client_livraison',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_agent_nom_complet(self, obj):
        """Retourne le nom complet de l'agent"""
        if obj.agent:
            return f"{obj.agent.nom} {obj.agent.prenom}"
        return None
    
    def get_distance_client_livraison(self, obj):
        """Calcule la distance entre le client et le point de livraison"""
        try:
            if obj.client.latitude and obj.client.longitude:
                return obj.get_distance_to(
                    obj.client.latitude,
                    obj.client.longitude
                )
        except (TypeError, ValueError):
            pass
        return None


class CommandeUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier une commande (Client - si en_attente)"""
    latitude_livraison = serializers.DecimalField(
        max_digits=10,
        decimal_places=8,
        required=False,
        min_value=-90,
        max_value=90,
        help_text="Nouvelle latitude du point de livraison"
    )
    longitude_livraison = serializers.DecimalField(
        max_digits=11,
        decimal_places=8,
        required=False,
        min_value=-180,
        max_value=180,
        help_text="Nouvelle longitude du point de livraison"
    )
    
    class Meta:
        model = Commande
        fields = ['latitude_livraison', 'longitude_livraison']
    
    def validate(self, data):
        """Vérifier que les coordonnées sont fournies ensemble"""
        latitude = data.get('latitude_livraison')
        longitude = data.get('longitude_livraison')
        
        if (latitude is not None and longitude is None) or (longitude is not None and latitude is None):
            raise serializers.ValidationError(
                "Les coordonnées latitude et longitude doivent être fournies ensemble"
            )
        
        return data
    
    def update(self, instance, validated_data):
        """Mise à jour des coordonnées de livraison"""
        logger.info(f"Mise à jour commande #{instance.id}")
        
        if 'latitude_livraison' in validated_data:
            instance.latitude_livraison = validated_data['latitude_livraison']
        
        if 'longitude_livraison' in validated_data:
            instance.longitude_livraison = validated_data['longitude_livraison']
        
        instance.save()
        
        logger.info(
            f"Commande #{instance.id} mise à jour - "
            f"Nouveau GPS: {instance.latitude_livraison}, {instance.longitude_livraison}"
        )
        return instance


class CommandeAssignSerializer(serializers.Serializer):
    """Serializer pour assigner une commande à un agent (Admin)"""
    agent_id = serializers.IntegerField(min_value=1)
    
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
    
    def validate_statut(self, value):
        """Valider la transition de statut"""
        instance = self.instance
        
        if not instance:
            return value
        
        # Règles de transition
        current_statut = instance.statut
        
        # On ne peut pas revenir en arrière (sauf annulation)
        statut_order = {
            'en_attente': 0,
            'acceptee': 1,
            'en_cours': 2,
            'livree': 3,
            'annulee': 99
        }
        
        if value != 'annulee':
            if statut_order.get(value, 0) < statut_order.get(current_statut, 0):
                raise serializers.ValidationError(
                    f"Impossible de passer de '{current_statut}' à '{value}'"
                )
        
        # Une commande livrée ne peut plus être modifiée
        if current_statut == 'livree':
            raise serializers.ValidationError(
                "Une commande livrée ne peut plus être modifiée"
            )
        
        # Une commande annulée ne peut plus être modifiée
        if current_statut == 'annulee':
            raise serializers.ValidationError(
                "Une commande annulée ne peut plus être modifiée"
            )
        
        return value


# ==================== NOTIFICATIONS ====================

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