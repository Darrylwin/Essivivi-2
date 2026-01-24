from rest_framework import serializers
from .models import Categorie, Produit
import logging

logger = logging.getLogger('products')


class CategorieSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories"""
    nombre_produits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categorie
        fields = [
            'id', 'nom', 'description', 'image', 'ordre',
            'actif', 'nombre_produits', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer compact pour lister les produits"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id', 'reference', 'nom', 'marque', 'volume',
            'unite_vente', 'prix_unitaire', 'prix_gros',
            'categorie', 'categorie_nom', 'image', 'actif'
        ]


class ProduitDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un produit"""
    categorie_detail = CategorieSerializer(source='categorie', read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id', 'reference', 'nom', 'description', 'marque', 'volume',
            'unite_vente', 'prix_unitaire', 'prix_gros', 'stock_minimum',
            'categorie', 'categorie_detail', 'image', 'actif', 'ordre',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProduitCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier un produit"""
    
    class Meta:
        model = Produit
        fields = [
            'categorie', 'nom', 'description', 'reference',
            'marque', 'volume', 'unite_vente', 'prix_unitaire',
            'prix_gros', 'stock_minimum', 'image', 'actif', 'ordre'
        ]
    
    def validate_reference(self, value):
        """Vérifie que la référence est unique (sauf si update)"""
        instance = self.instance
        if Produit.objects.filter(reference=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Cette référence existe déjà")
        return value