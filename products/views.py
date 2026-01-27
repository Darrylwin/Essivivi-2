from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from .models import Categorie, Produit
from .serializers import (
    CategorieSerializer,
    CategorieListSerializer,
    CategorieAvecProduitsSerializer,
    ProduitListSerializer,
    ProduitDetailSerializer,
    ProduitCreateSerializer,
    ProduitUpdateSerializer
)
from users.permissions import IsAdmin

logger = logging.getLogger('products')


# ==================== CATÉGORIES ====================

class CategorieListCreateView(APIView):
    """
    GET: Liste toutes les catégories
    POST: Crée une nouvelle catégorie (Admin)
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Liste toutes les catégories avec filtres optionnels",
        manual_parameters=[
            openapi.Parameter(
                'actif',
                openapi.IN_QUERY,
                description="Filtrer par statut (true/false)",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'avec_produits',
                openapi.IN_QUERY,
                description="Inclure les produits de chaque catégorie (true/false)",
                type=openapi.TYPE_BOOLEAN
            ),
        ],
        responses={200: CategorieListSerializer(many=True)}
    )
    def get(self, request):
        """Liste toutes les catégories"""
        logger.info("Récupération de la liste des catégories")
        
        categories = Categorie.objects.all()
        
        # Filtre par statut actif
        actif = request.query_params.get('actif')
        if actif is not None:
            actif_bool = actif.lower() == 'true'
            categories = categories.filter(actif=actif_bool)
            logger.info(f"Filtre actif appliqué : {actif_bool}")
        
        # Choisir le serializer
        avec_produits = request.query_params.get('avec_produits', 'false').lower() == 'true'
        
        if avec_produits:
            serializer = CategorieAvecProduitsSerializer(categories, many=True)
        else:
            serializer = CategorieListSerializer(categories, many=True)
        
        logger.info(f"{categories.count()} catégories trouvées")
        
        return Response({
            'count': categories.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Crée une nouvelle catégorie (Admin uniquement)",
        request_body=CategorieSerializer,
        responses={201: CategorieSerializer()}
    )
    def post(self, request):
        """Crée une nouvelle catégorie (Admin)"""
        # Vérifier que l'utilisateur est admin
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur pour créer une catégorie'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info("Création d'une nouvelle catégorie")
        
        serializer = CategorieSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        categorie = serializer.save()
        
        return Response({
            'message': 'Catégorie créée avec succès',
            'categorie': CategorieSerializer(categorie).data
        }, status=status.HTTP_201_CREATED)


class CategorieDetailView(APIView):
    """
    GET: Récupère une catégorie
    PUT/PATCH: Modifie une catégorie (Admin)
    DELETE: Supprime une catégorie (Admin)
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Récupère les détails d'une catégorie avec ses produits",
        responses={200: CategorieAvecProduitsSerializer()}
    )
    def get(self, request, pk):
        """Récupère une catégorie"""
        logger.info(f"Récupération catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        # Passer le request dans le contexte pour les URLs des photos
        serializer = CategorieAvecProduitsSerializer(
            categorie, 
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie une catégorie (Admin uniquement)",
        request_body=CategorieSerializer,
        responses={200: CategorieSerializer()}
    )
    def put(self, request, pk):
        """Modifie une catégorie (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Modification catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        serializer = CategorieSerializer(categorie, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        categorie = serializer.save()
        
        return Response({
            'message': 'Catégorie mise à jour avec succès',
            'categorie': CategorieSerializer(categorie).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie partiellement une catégorie (Admin uniquement)",
        request_body=CategorieSerializer,
        responses={200: CategorieSerializer()}
    )
    def patch(self, request, pk):
        """Modifie partiellement une catégorie (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Modification partielle catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        serializer = CategorieSerializer(categorie, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        categorie = serializer.save()
        
        return Response({
            'message': 'Catégorie mise à jour avec succès',
            'categorie': CategorieSerializer(categorie).data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Supprime une catégorie (Admin uniquement)",
        responses={200: "Catégorie supprimée"}
    )
    def delete(self, request, pk):
        """Supprime une catégorie (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Suppression catégorie ID {pk}")
        categorie = get_object_or_404(Categorie, pk=pk)
        
        # Vérifier qu'il n'y a pas de produits
        if categorie.produits.exists():
            count = categorie.produits.count()
            return Response({
                'error': f"Impossible de supprimer : cette catégorie contient {count} produit(s). "
                        f"Supprimez d'abord les produits."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        nom = categorie.nom
        categorie.delete()
        logger.info(f"Catégorie supprimée : {nom}")
        
        return Response({
            'message': f"Catégorie '{nom}' supprimée avec succès"
        }, status=status.HTTP_200_OK)


# ==================== PRODUITS ====================

class ProduitListCreateView(APIView):
    """
    GET: Liste tous les produits
    POST: Crée un nouveau produit (Admin)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Liste tous les produits avec filtres optionnels",
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
                description="Rechercher par nom, marque ou volume",
                type=openapi.TYPE_STRING
            ),
        ],
        responses={200: ProduitListSerializer(many=True)}
    )
    def get(self, request):
        """Liste tous les produits"""
        logger.info("Récupération de la liste des produits")
        
        produits = Produit.objects.select_related('categorie').all()
        
        # Filtre par catégorie
        categorie_id = request.query_params.get('categorie_id')
        if categorie_id:
            produits = produits.filter(categorie_id=categorie_id)
            logger.info(f"Filtre categorie_id appliqué : {categorie_id}")
        
        # Filtre par statut actif
        actif = request.query_params.get('actif')
        if actif is not None:
            actif_bool = actif.lower() == 'true'
            produits = produits.filter(actif=actif_bool)
            logger.info(f"Filtre actif appliqué : {actif_bool}")
        
        # Recherche
        search = request.query_params.get('search')
        if search:
            produits = produits.filter(
                Q(nom__icontains=search) |
                Q(marque__icontains=search) |
                Q(volume__icontains=search)
            )
            logger.info(f"Recherche appliquée : {search}")
        
        # Passer le request dans le contexte pour les URLs des photos
        serializer = ProduitListSerializer(
            produits, 
            many=True, 
            context={'request': request}
        )
        logger.info(f"{produits.count()} produits trouvés")
        
        return Response({
            'count': produits.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Crée un nouveau produit (Admin uniquement)",
        request_body=ProduitCreateSerializer,
        responses={201: ProduitDetailSerializer()}
    )
    def post(self, request):
        """Crée un nouveau produit (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur pour créer un produit'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info("Création d'un nouveau produit")
        
        serializer = ProduitCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        # Passer le request dans le contexte pour l'URL de la photo
        detail_serializer = ProduitDetailSerializer(
            produit, 
            context={'request': request}
        )
        
        return Response({
            'message': 'Produit créé avec succès',
            'produit': detail_serializer.data
        }, status=status.HTTP_201_CREATED)


class ProduitDetailView(APIView):
    """
    GET: Récupère un produit
    PUT/PATCH: Modifie un produit (Admin)
    DELETE: Supprime un produit (Admin)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Récupère les détails d'un produit",
        responses={200: ProduitDetailSerializer()}
    )
    def get(self, request, pk):
        """Récupère un produit"""
        logger.info(f"Récupération produit ID {pk}")
        produit = get_object_or_404(Produit.objects.select_related('categorie'), pk=pk)
        
        # Passer le request dans le contexte pour l'URL de la photo
        serializer = ProduitDetailSerializer(
            produit, 
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie un produit (Admin uniquement)",
        request_body=ProduitUpdateSerializer,
        responses={200: ProduitDetailSerializer()}
    )
    def put(self, request, pk):
        """Modifie un produit (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Modification produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        serializer = ProduitUpdateSerializer(produit, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        # Passer le request dans le contexte pour l'URL de la photo
        detail_serializer = ProduitDetailSerializer(
            produit, 
            context={'request': request}
        )
        
        return Response({
            'message': 'Produit mis à jour avec succès',
            'produit': detail_serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Modifie partiellement un produit (Admin uniquement)",
        request_body=ProduitUpdateSerializer,
        responses={200: ProduitDetailSerializer()}
    )
    def patch(self, request, pk):
        """Modifie partiellement un produit (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Modification partielle produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        serializer = ProduitUpdateSerializer(produit, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        # Passer le request dans le contexte pour l'URL de la photo
        detail_serializer = ProduitDetailSerializer(
            produit, 
            context={'request': request}
        )
        
        return Response({
            'message': 'Produit mis à jour avec succès',
            'produit': detail_serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Supprime un produit (Admin uniquement)",
        responses={200: "Produit supprimé"}
    )
    def delete(self, request, pk):
        """Supprime un produit (Admin)"""
        if not (hasattr(request.user, 'is_staff') and request.user.is_staff):
            return Response(
                {'error': 'Vous devez être administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"Suppression produit ID {pk}")
        produit = get_object_or_404(Produit, pk=pk)
        
        produit.delete()
        logger.info(f"Produit supprimé : {produit.nom}")
        
        return Response({
            'message': f"Produit '{produit.nom}' supprimé avec succès"
        }, status=status.HTTP_200_OK)