from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Categorie, Produit
from .serializers import (
    CategorieSerializer,
    CategorieAvecProduitsSerializer,
    ProduitListSerializer,
    ProduitDetailSerializer,
    ProduitCreateUpdateSerializer
)
from users.permissions import IsAdmin, IsAdminOrReadOnly

logger = logging.getLogger('products')


# ==================== CATÉGORIES ====================

class CategorieListView(APIView):
    """
    Lister toutes les catégories
    
    Accessible par tous les utilisateurs authentifiés
    Filtres disponibles : actif
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Récupérer la liste de toutes les catégories",
        manual_parameters=[
            openapi.Parameter(
                'actif',
                openapi.IN_QUERY,
                description="Filtrer par statut (true/false). Ex: actif=true pour voir uniquement les catégories actives",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'avec_produits',
                openapi.IN_QUERY,
                description="Inclure la liste des produits de chaque catégorie (true/false)",
                type=openapi.TYPE_BOOLEAN
            ),
        ],
        responses={
            200: openapi.Response(
                description="Liste des catégories",
                examples={
                    "application/json": [
                        {
                            "id": 1,
                            "nom": "Eau en sachet",
                            "description": "Eau potable conditionnée en sachets",
                            "actif": True,
                            "nombre_produits": 3,
                            "created_at": "2024-01-20T10:00:00Z",
                            "updated_at": "2024-01-20T10:00:00Z"
                        }
                    ]
                }
            )
        }
    )
    def get(self, request):
        logger.info("Récupération de la liste des catégories")
        
        categories = Categorie.objects.all()
        
        # Filtrer par statut actif
        actif = request.query_params.get('actif', None)
        if actif is not None:
            actif_bool = actif.lower() == 'true'
            categories = categories.filter(actif=actif_bool)
            logger.info(f"Filtre appliqué : actif={actif_bool}")
        
        # Choisir le serializer selon le paramètre
        avec_produits = request.query_params.get('avec_produits', 'false').lower() == 'true'
        
        if avec_produits:
            serializer = CategorieAvecProduitsSerializer(categories, many=True, context={'request': request})
        else:
            serializer = CategorieSerializer(categories, many=True)
        
        logger.info(f"{categories.count()} catégories récupérées")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategorieCreateView(APIView):
    """
    Créer une nouvelle catégorie (Admin uniquement)
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="Créer une nouvelle catégorie de produits",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['nom'],
            properties={
                'nom': openapi.Schema(type=openapi.TYPE_STRING, description='Nom de la catégorie'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='Description (optionnelle)'),
                'actif': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Actif (true par défaut)'),
            },
            example={
                "nom": "Eau en sachet",
                "description": "Eau potable conditionnée en sachets",
                "actif": True
            }
        ),
        responses={
            201: openapi.Response(
                description="Catégorie créée avec succès",
                examples={
                    "application/json": {
                        "id": 1,
                        "nom": "Eau en sachet",
                        "description": "Eau potable conditionnée en sachets",
                        "actif": True,
                        "nombre_produits": 0,
                        "created_at": "2024-01-20T10:00:00Z",
                        "updated_at": "2024-01-20T10:00:00Z"
                    }
                }
            ),
            400: "Erreur de validation"
        }
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
    """
    Récupérer, modifier ou supprimer une catégorie
    """
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @swagger_auto_schema(
        operation_description="Récupérer les détails d'une catégorie",
        responses={
            200: CategorieAvecProduitsSerializer(),
            404: "Catégorie non trouvée"
        }
    )
    def get(self, request, pk):
        logger.info(f"Récupération de la catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        serializer = CategorieAvecProduitsSerializer(categorie, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifier une catégorie (Admin uniquement)",
        request_body=CategorieSerializer,
        responses={
            200: CategorieSerializer(),
            400: "Erreur de validation",
            404: "Catégorie non trouvée"
        }
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
    
    @swagger_auto_schema(
        operation_description="Supprimer une catégorie (Admin uniquement)",
        responses={
            204: "Catégorie supprimée avec succès",
            400: "Impossible de supprimer (contient des produits)",
            404: "Catégorie non trouvée"
        }
    )
    def delete(self, request, pk):
        logger.info(f"Suppression de la catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        # Vérifier qu'il n'y a pas de produits dans cette catégorie
        if categorie.produits.exists():
            count = categorie.produits.count()
            logger.warning(f"Impossible de supprimer la catégorie {categorie.nom} : contient {count} produit(s)")
            return Response(
                {
                    "error": f"Impossible de supprimer cette catégorie car elle contient {count} produit(s). "
                             f"Veuillez d'abord supprimer ou déplacer les produits."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nom = categorie.nom
        categorie.delete()
        
        logger.info(f"Catégorie supprimée : {nom}")
        
        return Response(
            {"message": f"Catégorie '{nom}' supprimée avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )


# ==================== PRODUITS ====================

class ProduitListView(APIView):
    """
    Lister tous les produits
    
    Accessible par tous les utilisateurs authentifiés
    Filtres : catégorie, actif, recherche
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Récupérer la liste de tous les produits avec filtres optionnels",
        manual_parameters=[
            openapi.Parameter(
                'categorie_id',
                openapi.IN_QUERY,
                description="Filtrer par catégorie (ID)",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'actif',
                openapi.IN_QUERY,
                description="Filtrer par statut (true/false)",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Rechercher par nom, marque",
                type=openapi.TYPE_STRING
            ),
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
            logger.info(f"Filtre appliqué : categorie_id={categorie_id}")
        
        # Filtrer par statut actif
        actif = request.query_params.get('actif', None)
        if actif is not None:
            actif_bool = actif.lower() == 'true'
            produits = produits.filter(actif=actif_bool)
            logger.info(f"Filtre appliqué : actif={actif_bool}")
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            produits = produits.filter(
                models.Q(nom__icontains=search) |
                models.Q(marque__icontains=search) |
                models.Q(volume__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        logger.info(f"{produits.count()} produits récupérés")
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProduitCreateView(APIView):
    """
    Créer un nouveau produit (Admin uniquement)
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="Créer un nouveau produit avec photo optionnelle",
        manual_parameters=[
            openapi.Parameter('categorie', openapi.IN_FORM, type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('nom', openapi.IN_FORM, type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('marque', openapi.IN_FORM, type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('volume', openapi.IN_FORM, type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('unite_vente', openapi.IN_FORM, type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('prix_unitaire', openapi.IN_FORM, type=openapi.TYPE_NUMBER, required=True),
            openapi.Parameter('photo', openapi.IN_FORM, type=openapi.TYPE_FILE, required=False),
            openapi.Parameter('actif', openapi.IN_FORM, type=openapi.TYPE_BOOLEAN, required=False),
        ],
        consumes=['multipart/form-data'],
        responses={
            201: ProduitDetailSerializer(),
            400: "Erreur de validation"
        }
    )
    def post(self, request):
        logger.info("Création d'un nouveau produit")
        
        serializer = ProduitCreateUpdateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        logger.info(f"Produit créé : {produit.nom_complet}")
        
        return Response(
            ProduitDetailSerializer(produit, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class ProduitDetailView(APIView):
    """
    Récupérer, modifier ou supprimer un produit
    """
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @swagger_auto_schema(
        operation_description="Récupérer les détails d'un produit",
        responses={
            200: ProduitDetailSerializer(),
            404: "Produit non trouvé"
        }
    )
    def get(self, request, pk):
        logger.info(f"Récupération du produit ID {pk}")
        produit = get_object_or_404(Produit.objects.select_related('categorie'), pk=pk)
        serializer = ProduitDetailSerializer(produit, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifier un produit (Admin uniquement)",
        manual_parameters=[
            openapi.Parameter('categorie', openapi.IN_FORM, type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('nom', openapi.IN_FORM, type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('marque', openapi.IN_FORM, type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('volume', openapi.IN_FORM, type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('unite_vente', openapi.IN_FORM, type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('prix_unitaire', openapi.IN_FORM, type=openapi.TYPE_NUMBER, required=False),
            openapi.Parameter('photo', openapi.IN_FORM, type=openapi.TYPE_FILE, required=False),
            openapi.Parameter('actif', openapi.IN_FORM, type=openapi.TYPE_BOOLEAN, required=False),
        ],
        consumes=['multipart/form-data'],
        responses={
            200: ProduitDetailSerializer(),
            400: "Erreur de validation",
            404: "Produit non trouvé"
        }
    )
    def put(self, request, pk):
        logger.info(f"Mise à jour du produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        serializer = ProduitCreateUpdateSerializer(produit, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        logger.info(f"Produit mis à jour : {produit.nom_complet}")
        
        return Response(
            ProduitDetailSerializer(produit, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    @swagger_auto_schema(
        operation_description="Supprimer un produit (Admin uniquement)",
        responses={
            204: "Produit supprimé avec succès",
            404: "Produit non trouvé"
        }
    )
    def delete(self, request, pk):
        logger.info(f"Suppression du produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        nom_complet = produit.nom_complet
        produit.delete()
        
        logger.info(f"Produit supprimé : {nom_complet}")
        
        return Response(
            {"message": f"Produit '{nom_complet}' supprimé avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )