from rest_framework import serializers
from django.utils import timezone
from .models import PositionAgent
from authentication.models import Agent
from tours.models import Tournee
import logging

logger = logging.getLogger('tracking')


class PositionAgentCreateSerializer(serializers.Serializer):
    """Serializer pour enregistrer une position"""
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8)
    precision = serializers.FloatField(required=False, allow_null=True)
    vitesse = serializers.FloatField(required=False, allow_null=True)
    altitude = serializers.FloatField(required=False, allow_null=True)
    
    def validate(self, data):
        """Validation des coordonnées GPS"""
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        
        # Vérifier que les coordonnées sont valides
        if not (-90 <= latitude <= 90):
            raise serializers.ValidationError(
                {"latitude": "La latitude doit être entre -90 et 90"}
            )
        
        if not (-180 <= longitude <= 180):
            raise serializers.ValidationError(
                {"longitude": "La longitude doit être entre -180 et 180"}
            )
        
        return data
    
    def create(self, validated_data):
        """Création de la position"""
        request = self.context.get('request')
        
        # Récupérer l'agent
        try:
            agent = Agent.objects.get(email=request.user.email)
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Agent non trouvé")
        
        # Vérifier que l'agent est en tournée
        if agent.statut != 'en_tournee':
            raise serializers.ValidationError(
                "Vous devez être en tournée pour envoyer votre position"
            )
        
        # Récupérer la tournée en cours
        tournee = Tournee.objects.filter(
            agent=agent,
            heure_fin__isnull=True
        ).first()
        
        # Créer la position
        position = PositionAgent.objects.create(
            agent=agent,
            tournee=tournee,
            latitude=validated_data['latitude'],
            longitude=validated_data['longitude'],
            precision=validated_data.get('precision'),
            vitesse=validated_data.get('vitesse'),
            altitude=validated_data.get('altitude')
        )
        
        logger.info(
            f"Position enregistrée pour {agent.numero_identification} : "
            f"({position.latitude}, {position.longitude})"
        )
        
        return position


class PositionAgentSerializer(serializers.ModelSerializer):
    """Serializer pour les positions d'agents"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    agent_prenom = serializers.CharField(source='agent.prenom', read_only=True)
    agent_telephone = serializers.CharField(source='agent.telephone', read_only=True)
    tournee_id = serializers.IntegerField(source='tournee.id', read_only=True, allow_null=True)
    distance_depuis_derniere = serializers.SerializerMethodField()
    
    class Meta:
        model = PositionAgent
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom', 'agent_prenom', 'agent_telephone',
            'tournee', 'tournee_id',
            'latitude', 'longitude', 'precision', 'vitesse', 'altitude',
            'timestamp', 'distance_depuis_derniere'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_distance_depuis_derniere(self, obj):
        """Calcule la distance depuis la dernière position"""
        try:
            distance = obj.distance_depuis_derniere_position()
            return round(distance, 2) if distance else 0
        except Exception:
            return 0


class PositionAgentListSerializer(serializers.ModelSerializer):
    """Serializer compact pour lister les positions"""
    agent_numero = serializers.CharField(source='agent.numero_identification', read_only=True)
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    
    class Meta:
        model = PositionAgent
        fields = [
            'id', 'agent', 'agent_numero', 'agent_nom',
            'latitude', 'longitude', 'vitesse', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class AgentEnTourneeSerializer(serializers.Serializer):
    """Serializer pour les agents en tournée avec leur dernière position"""
    agent_id = serializers.IntegerField(source='id')
    agent_numero = serializers.CharField(source='numero_identification')
    agent_nom = serializers.CharField(source='nom')
    agent_prenom = serializers.CharField(source='prenom')
    agent_telephone = serializers.CharField(source='telephone')
    derniere_position = serializers.SerializerMethodField()
    temps_depuis_derniere_position = serializers.SerializerMethodField()
    
    def get_derniere_position(self, obj):
        """Récupère la dernière position de l'agent"""
        position = PositionAgent.get_derniere_position(obj)
        if position:
            return {
                'latitude': float(position.latitude),
                'longitude': float(position.longitude),
                'vitesse': position.vitesse,
                'timestamp': position.timestamp
            }
        return None
    
    def get_temps_depuis_derniere_position(self, obj):
        """Calcule le temps écoulé depuis la dernière position"""
        position = PositionAgent.get_derniere_position(obj)
        if position:
            delta = timezone.now() - position.timestamp
            minutes = delta.total_seconds() / 60
            return round(minutes, 1)
        return None


class TempsEstimeSerializer(serializers.Serializer):
    """Serializer pour le calcul du temps estimé"""
    agent_id = serializers.IntegerField()
    destination_latitude = serializers.DecimalField(max_digits=10, decimal_places=8)
    destination_longitude = serializers.DecimalField(max_digits=11, decimal_places=8)
    vitesse_moyenne = serializers.FloatField(default=20, required=False)
    
    def validate_agent_id(self, value):
        """Vérifier que l'agent existe"""
        try:
            Agent.objects.get(id=value)
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Agent non trouvé")
        return value