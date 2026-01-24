from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import models
import logging

from .models import Categorie, Produit
from .serializers import (
    CategorieSerializer, ProduitListSerializer,
    ProduitDetailSerializer, ProduitCreateUpdateSerializer
)
from users.permissions import IsAdmin, IsAdminOrReadOnly

logger = logging.getLogger('products')


# ==================== CATÉGORIES ====================

class CategorieListView(APIView):
    """Lister toutes les catégories"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('actif', openapi.IN_QUERY, description="Filtrer par statut actif (true/false)", type=openapi.TYPE_BOOLEAN),
        ],
        responses={200: CategorieSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des catégories")
        
        categories = Categorie.objects.all()
        
        # Filtrer par statut actif
        actif = request.query_params.get('actif', None)
        if actif is not None:
            actif_bool = actif.lower() == 'true'
            categories = categories.filter(actif=actif_bool)
        
        serializer = CategorieSerializer(categories, many=True)
        logger.info(f"{categories.count()} catégories récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategorieCreateView(APIView):
    """Créer une catégorie (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        request_body=CategorieSerializer,
        responses={201: CategorieSerializer()}
    )
    def post(self, request):
        logger.info("Création d'une nouvelle catégorie")
        
        serializer = CategorieSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        categorie = serializer.save()
        
        logger.info(f"Catégorie créée : {categorie.nom}")
        
        return Response(
            CategorieSerializer(categorie).data,
            status=status.HTTP_201_CREATED
        )


class CategorieDetailView(APIView):
    """Récupérer, modifier ou supprimer une catégorie"""
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @swagger_auto_schema(responses={200: CategorieSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération de la catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        serializer = CategorieSerializer(categorie)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=CategorieSerializer,
        responses={200: CategorieSerializer()}
    )
    def put(self, request, pk):
        logger.info(f"Mise à jour de la catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        serializer = CategorieSerializer(categorie, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        categorie = serializer.save()
        
        logger.info(f"Catégorie mise à jour : {categorie.nom}")
        
        return Response(
            CategorieSerializer(categorie).data,
            status=status.HTTP_200_OK
        )
    
    def delete(self, request, pk):
        logger.info(f"Suppression de la catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        # Vérifier qu'il n'y a pas de produits dans cette catégorie
        if categorie.produits.exists():
            return Response(
                {"error": f"Impossible de supprimer cette catégorie car elle contient {categorie.nombre_produits} produit(s)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nom = categorie.nom
        categorie.delete()
        
        logger.info(f"Catégorie supprimée : {nom}")
        
        return Response(
            {"message": "Catégorie supprimée avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )


# ==================== PRODUITS ====================

class ProduitListView(APIView):
    """Lister tous les produits"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('categorie_id', openapi.IN_QUERY, description="Filtrer par catégorie", type=openapi.TYPE_INTEGER),
            openapi.Parameter('actif', openapi.IN_QUERY, description="Filtrer par statut actif", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('search', openapi.IN_QUERY, description="Rechercher par nom ou référence", type=openapi.TYPE_STRING),
        ],
        responses={200: ProduitListSerializer(many=True)}
    )
    def get(self, request):
        logger.info("Récupération de la liste des produits")
        
        produits = Produit.objects.select_related('categorie').all()
        
        # Filtrer par catégorie
        categorie_id = request.query_params.get('categorie_id', None)
        if categorie_id:
            produits = produits.filter(categorie_id=categorie_id)
        
        # Filtrer par statut actif
        actif = request.query_params.get('actif', None)
        if actif is not None:
            actif_bool = actif.lower() == 'true'
            produits = produits.filter(actif=actif_bool)
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            produits = produits.filter(
                models.Q(nom__icontains=search) |
                models.Q(reference__icontains=search) |
                models.Q(marque__icontains=search)
            )
        
        serializer = ProduitListSerializer(produits, many=True)
        logger.info(f"{produits.count()} produits récupérés")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProduitCreateView(APIView):
    """Créer un produit (Admin uniquement)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        request_body=ProduitCreateUpdateSerializer,
        responses={201: ProduitDetailSerializer()}
    )
    def post(self, request):
        logger.info("Création d'un nouveau produit")
        
        serializer = ProduitCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        logger.info(f"Produit créé : {produit.reference} - {produit.nom}")
        
        return Response(
            ProduitDetailSerializer(produit).data,
            status=status.HTTP_201_CREATED
        )


class ProduitDetailView(APIView):
    """Récupérer, modifier ou supprimer un produit"""
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @swagger_auto_schema(responses={200: ProduitDetailSerializer()})
    def get(self, request, pk):
        logger.info(f"Récupération du produit ID {pk}")
        produit = get_object_or_404(Produit.objects.select_related('categorie'), pk=pk)
        serializer = ProduitDetailSerializer(produit)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=ProduitCreateUpdateSerializer,
        responses={200: ProduitDetailSerializer()}
    )
    def put(self, request, pk):
        logger.info(f"Mise à jour du produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        serializer = ProduitCreateUpdateSerializer(produit, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        logger.info(f"Produit mis à jour : {produit.reference}")
        
        return Response(
            ProduitDetailSerializer(produit).data,
            status=status.HTTP_200_OK
        )
    
    def delete(self, request, pk):
        logger.info(f"Suppression du produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        reference = produit.reference
        produit.delete()
        
        logger.info(f"Produit supprimé : {reference}")
        
        return Response(
            {"message": "Produit supprimé avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )