from rest_framework import serializers
from .models import Categorie, Produit
import logging

logger = logging.getLogger('products')


# ==================== CATÉGORIES ====================

class CategorieSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories"""
    nombre_produits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categorie
        fields = [
            'id', 'nom', 'description', 'actif',
            'nombre_produits', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'nombre_produits', 'created_at', 'updated_at']
    
    def validate_nom(self, value):
        """Vérifier que le nom est unique"""
        instance = self.instance
        if Categorie.objects.filter(nom=value).exclude(
            pk=instance.pk if instance else None
        ).exists():
            raise serializers.ValidationError(
                "Une catégorie avec ce nom existe déjà"
            )
        return value


class CategorieListSerializer(serializers.ModelSerializer):
    """Serializer compact pour lister les catégories"""
    nombre_produits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'actif', 'nombre_produits']
        read_only_fields = ['id', 'nombre_produits']


# ==================== PRODUITS ====================

class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer compact pour lister les produits"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'marque', 'volume',
            'unite_vente', 'prix_unitaire', 'categorie',
            'categorie_nom', 'actif'
        ]
        read_only_fields = ['id']


class ProduitDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un produit"""
    categorie_detail = CategorieListSerializer(source='categorie', read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'marque', 'volume',
            'unite_vente', 'prix_unitaire', 'photo', 'categorie',
            'categorie_detail', 'actif', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProduitCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un produit"""
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(),
        source='categorie',
        write_only=True,
        help_text="ID de la catégorie"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo du produit (optionnelle)"
    )
    
    class Meta:
        model = Produit
        fields = [
            'categorie_id', 'nom', 'marque', 'volume',
            'unite_vente', 'prix_unitaire', 'photo', 'actif'
        ]
    
    def validate_prix_unitaire(self, value):
        """Vérifier que le prix est positif"""
        if value <= 0:
            raise serializers.ValidationError(
                "Le prix doit être supérieur à 0"
            )
        return value
    
    def validate(self, data):
        """Validation de l'unicité"""
        categorie = data.get('categorie')
        nom = data.get('nom')
        volume = data.get('volume')
        
        # Vérifier l'unicité (catégorie + nom + volume)
        if Produit.objects.filter(
            categorie=categorie,
            nom=nom,
            volume=volume
        ).exists():
            raise serializers.ValidationError(
                "Un produit avec ce nom et ce volume existe déjà dans cette catégorie"
            )
        
        return data
    
    def create(self, validated_data):
        logger.info(f"Création du produit : {validated_data.get('nom')}")
        produit = Produit.objects.create(**validated_data)
        logger.info(f"Produit créé : {produit.nom} (ID: {produit.id})")
        return produit


class ProduitUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un produit"""
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(),
        source='categorie',
        required=False,
        help_text="ID de la catégorie"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo du produit"
    )
    
    class Meta:
        model = Produit
        fields = [
            'categorie_id', 'nom', 'marque', 'volume',
            'unite_vente', 'prix_unitaire', 'photo', 'actif'
        ]
    
    def validate_prix_unitaire(self, value):
        """Vérifier que le prix est positif"""
        if value and value <= 0:
            raise serializers.ValidationError(
                "Le prix doit être supérieur à 0"
            )
        return value
    
    def validate(self, data):
        """Validation de l'unicité (sauf pour le produit actuel)"""
        instance = self.instance
        categorie = data.get('categorie', instance.categorie if instance else None)
        nom = data.get('nom', instance.nom if instance else None)
        volume = data.get('volume', instance.volume if instance else None)
        
        # Vérifier l'unicité (exclure le produit actuel)
        queryset = Produit.objects.filter(
            categorie=categorie,
            nom=nom,
            volume=volume
        )
        
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Un produit avec ce nom et ce volume existe déjà dans cette catégorie"
            )
        
        return data
    
    def update(self, instance, validated_data):
        logger.info(f"Mise à jour du produit : {instance.nom}")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        logger.info(f"Produit mis à jour : {instance.nom}")
        return instance


class CategorieAvecProduitsSerializer(serializers.ModelSerializer):
    """Serializer pour afficher une catégorie avec ses produits"""
    produits = ProduitListSerializer(many=True, read_only=True)
    nombre_produits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categorie
        fields = [
            'id', 'nom', 'description', 'actif',
            'nombre_produits', 'produits',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'nombre_produits', 'created_at', 'updated_at']