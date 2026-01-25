from rest_framework import serializers
from .models import Categorie, Produit
import logging

logger = logging.getLogger('products')


class CategorieSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de produits"""
    nombre_produits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categorie
        fields = [
            'id',
            'nom',
            'description',
            'actif',
            'nombre_produits',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer compact pour lister les produits (pour les agents)"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id',
            'nom',
            'nom_complet',
            'marque',
            'volume',
            'unite_vente',
            'prix_unitaire',
            'categorie',
            'categorie_nom',
            'actif'
        ]
        read_only_fields = ['id', 'nom_complet']


class ProduitDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un produit"""
    categorie_detail = CategorieSerializer(source='categorie', read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id',
            'nom',
            'nom_complet',
            'marque',
            'volume',
            'unite_vente',
            'prix_unitaire',
            'categorie',
            'categorie_detail',
            'actif',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'nom_complet', 'created_at', 'updated_at']


class ProduitCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer ou modifier un produit"""
    
    class Meta:
        model = Produit
        fields = [
            'categorie',
            'nom',
            'marque',
            'volume',
            'unite_vente',
            'prix_unitaire',
            'actif'
        ]
    
    def validate(self, data):
        """Validation personnalisée"""
        # Vérifier que le prix est positif
        if data.get('prix_unitaire') and data['prix_unitaire'] <= 0:
            raise serializers.ValidationError({
                'prix_unitaire': 'Le prix doit être supérieur à 0'
            })
        
        # Vérifier l'unicité (catégorie + nom + volume)
        instance = self.instance
        categorie = data.get('categorie')
        nom = data.get('nom')
        volume = data.get('volume')
        
        if categorie and nom:
            queryset = Produit.objects.filter(
                categorie=categorie,
                nom=nom,
                volume=volume
            )
            
            # Exclure l'instance actuelle si modification
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError(
                    'Un produit avec ce nom et ce volume existe déjà dans cette catégorie'
                )
        
        return data
    
    def create(self, validated_data):
        logger.info(f"Création du produit : {validated_data.get('nom')}")
        produit = Produit.objects.create(**validated_data)
        logger.info(f"Produit créé : {produit.nom_complet}")
        return produit
    
    def update(self, instance, validated_data):
        logger.info(f"Mise à jour du produit : {instance.nom_complet}")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        logger.info(f"Produit mis à jour : {instance.nom_complet}")
        return instance


class CategorieAvecProduitsSerializer(serializers.ModelSerializer):
    """Serializer pour afficher une catégorie avec ses produits"""
    produits = ProduitListSerializer(many=True, read_only=True)
    nombre_produits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categorie
        fields = [
            'id',
            'nom',
            'description',
            'actif',
            'nombre_produits',
            'produits',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']