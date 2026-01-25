/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * =====================================================
 * Hook - Gestion des Catégories & Produits
 * =====================================================
 * Hook React pour la gestion du catalogue produits (Admin)
 * 
 * @module lib/hooks/useProducts
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { productsApi } from "../api";
import type {
  CategorieList,
  CategorieDetail,
  CategorieAvecProduits,
  CategorieCreateRequest,
  CategorieUpdateRequest,
  CategorieListResponse,
  CategorieAvecProduitsResponse,
  CategorieDetailResponse,
  ProduitList,
  ProduitDetail,
  ProduitCreateRequest,
  ProduitUpdateRequest,
  ProduitListResponse,
  ProduitDetailResponse,
  SimpleMessageResponse,
  CategorieQueryParams,
  ProduitQueryParams,
} from "../types";

interface UseProductsState {
  // Catégories
  categories: CategorieAvecProduits[];
  categoriesCount: number;
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Produits
  produits: ProduitList[];
  produitsCount: number;
  produitsLoading: boolean;
  produitsError: string | null;
  
  // Détails
  currentCategorie: CategorieAvecProduits | null;
  currentProduit: ProduitDetail | null;
  detailLoading: boolean;
  detailError: string | null;
}

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    // Catégories
    categories: [],
    categoriesCount: 0,
    categoriesLoading: false,
    categoriesError: null,
    
    // Produits
    produits: [],
    produitsCount: 0,
    produitsLoading: false,
    produitsError: null,
    
    // Détails
    currentCategorie: null,
    currentProduit: null,
    detailLoading: false,
    detailError: null,
  });

  // ========== CATÉGORIES ==========
  
  const fetchCategories = useCallback(async (params?: CategorieQueryParams) => {
    setState(prev => ({ ...prev, categoriesLoading: true, categoriesError: null }));
    
    try {
      const response = await productsApi.getCategories(params);
      setState(prev => ({
        ...prev,
        categories: response.results,
        categoriesCount: response.count,
        categoriesLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        categoriesError: error.message || "Erreur lors du chargement des catégories",
        categoriesLoading: false,
      }));
      throw error;
    }
  }, []);

  const fetchCategorie = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const categorie = await productsApi.getCategorie(id);
      setState(prev => ({
        ...prev,
        currentCategorie: categorie,
        detailLoading: false,
      }));
      
      return categorie;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors du chargement de la catégorie",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const createCategorie = useCallback(async (data: CategorieCreateRequest): Promise<CategorieDetailResponse> => {
    setState(prev => ({ ...prev, categoriesLoading: true, categoriesError: null }));
    
    try {
      const response = await productsApi.createCategorie(data);
      
      // Ajouter à la liste
      const newCategorie: CategorieAvecProduits = {
        id: response.categorie.id,
        nom: response.categorie.nom,
        description: response.categorie.description,
        actif: response.categorie.actif,
        nombre_produits: 0,
        produits: [],
        created_at: response.categorie.created_at,
        updated_at: response.categorie.updated_at,
      };
      
      setState(prev => ({
        ...prev,
        categories: [newCategorie, ...prev.categories],
        categoriesCount: prev.categoriesCount + 1,
        categoriesLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        categoriesError: error.message || "Erreur lors de la création de la catégorie",
        categoriesLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateCategorie = useCallback(async (id: number, data: CategorieUpdateRequest): Promise<CategorieDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await productsApi.updateCategorie(id, data);
      
      // Mettre à jour dans la liste
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(categorie => {
          if (categorie.id === id) {
            return {
              ...categorie,
              nom: response.categorie.nom || categorie.nom,
              description: response.categorie.description ?? categorie.description,
              actif: response.categorie.actif ?? categorie.actif,
              updated_at: response.categorie.updated_at,
            };
          }
          return categorie;
        }),
        currentCategorie: prev.currentCategorie?.id === id ? {
          ...prev.currentCategorie,
          ...response.categorie,
        } : prev.currentCategorie,
        detailLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour de la catégorie",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const patchCategorie = useCallback(async (id: number, data: CategorieUpdateRequest): Promise<CategorieDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await productsApi.patchCategorie(id, data);
      
      // Mettre à jour dans la liste
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(categorie => {
          if (categorie.id === id) {
            return {
              ...categorie,
              ...response.categorie,
            };
          }
          return categorie;
        }),
        currentCategorie: prev.currentCategorie?.id === id ? {
          ...prev.currentCategorie,
          ...response.categorie,
        } : prev.currentCategorie,
        detailLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour de la catégorie",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const deleteCategorie = useCallback(async (id: number): Promise<SimpleMessageResponse> => {
    try {
      const response = await productsApi.deleteCategorie(id);
      
      // Retirer de la liste
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(categorie => categorie.id !== id),
        categoriesCount: prev.categoriesCount - 1,
        currentCategorie: prev.currentCategorie?.id === id ? null : prev.currentCategorie,
      }));
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }, []);

  // ========== PRODUITS ==========
  
  const fetchProduits = useCallback(async (params?: ProduitQueryParams) => {
    setState(prev => ({ ...prev, produitsLoading: true, produitsError: null }));
    
    try {
      const response = await productsApi.getProduits(params);
      setState(prev => ({
        ...prev,
        produits: response.results,
        produitsCount: response.count,
        produitsLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        produitsError: error.message || "Erreur lors du chargement des produits",
        produitsLoading: false,
      }));
      throw error;
    }
  }, []);

  const fetchProduit = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const produit = await productsApi.getProduit(id);
      setState(prev => ({
        ...prev,
        currentProduit: produit,
        detailLoading: false,
      }));
      
      return produit;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors du chargement du produit",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const createProduit = useCallback(async (data: ProduitCreateRequest): Promise<ProduitDetailResponse> => {
    setState(prev => ({ ...prev, produitsLoading: true, produitsError: null }));
    
    try {
      const response = await productsApi.createProduit(data);
      
      // Ajouter à la liste (format simplifié)
      const newProduitList: ProduitList = {
        id: response.produit.id,
        nom: response.produit.nom,
        marque: response.produit.marque,
        volume: response.produit.volume,
        unite_vente: response.produit.unite_vente,
        prix_unitaire: response.produit.prix_unitaire,
        categorie: response.produit.categorie,
        categorie_nom: response.produit.categorie_detail.nom,
        actif: response.produit.actif,
        created_at: response.produit.created_at,
        updated_at: response.produit.updated_at,
      };
      
      // Mettre à jour le compteur dans la catégorie correspondante
      setState(prev => ({
        ...prev,
        produits: [newProduitList, ...prev.produits],
        produitsCount: prev.produitsCount + 1,
        categories: prev.categories.map(categorie => {
          if (categorie.id === response.produit.categorie) {
            return {
              ...categorie,
              nombre_produits: categorie.nombre_produits + 1,
              produits: [newProduitList, ...categorie.produits],
            };
          }
          return categorie;
        }),
        produitsLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        produitsError: error.message || "Erreur lors de la création du produit",
        produitsLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateProduit = useCallback(async (id: number, data: ProduitUpdateRequest): Promise<ProduitDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await productsApi.updateProduit(id, data);
      
      // Mettre à jour dans la liste
      const updatedProduitList: ProduitList = {
        id: response.produit.id,
        nom: response.produit.nom,
        marque: response.produit.marque,
        volume: response.produit.volume,
        unite_vente: response.produit.unite_vente,
        prix_unitaire: response.produit.prix_unitaire,
        categorie: response.produit.categorie,
        categorie_nom: response.produit.categorie_detail.nom,
        actif: response.produit.actif,
        created_at: response.produit.created_at,
        updated_at: response.produit.updated_at,
      };
      
      setState(prev => ({
        ...prev,
        produits: prev.produits.map(produit => 
          produit.id === id ? updatedProduitList : produit
        ),
        currentProduit: response.produit,
        // Mettre à jour aussi dans les catégories si la catégorie a changé
        categories: prev.categories.map(categorie => {
          const oldProduit = prev.produits.find(p => p.id === id);
          
          // Si le produit a changé de catégorie
          if (oldProduit && oldProduit.categorie !== response.produit.categorie) {
            // Retirer de l'ancienne catégorie
            if (categorie.id === oldProduit.categorie) {
              return {
                ...categorie,
                nombre_produits: categorie.nombre_produits - 1,
                produits: categorie.produits.filter(p => p.id !== id),
              };
            }
            // Ajouter à la nouvelle catégorie
            if (categorie.id === response.produit.categorie) {
              return {
                ...categorie,
                nombre_produits: categorie.nombre_produits + 1,
                produits: [updatedProduitList, ...categorie.produits],
              };
            }
          }
          // Mettre à jour dans la même catégorie
          if (categorie.id === response.produit.categorie) {
            return {
              ...categorie,
              produits: categorie.produits.map(p => 
                p.id === id ? updatedProduitList : p
              ),
            };
          }
          return categorie;
        }),
        detailLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour du produit",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const patchProduit = useCallback(async (id: number, data: ProduitUpdateRequest): Promise<ProduitDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await productsApi.patchProduit(id, data);
      
      // Mettre à jour dans la liste
      const updatedProduitList: ProduitList = {
        id: response.produit.id,
        nom: response.produit.nom,
        marque: response.produit.marque,
        volume: response.produit.volume,
        unite_vente: response.produit.unite_vente,
        prix_unitaire: response.produit.prix_unitaire,
        categorie: response.produit.categorie,
        categorie_nom: response.produit.categorie_detail.nom,
        actif: response.produit.actif,
        created_at: response.produit.created_at,
        updated_at: response.produit.updated_at,
      };
      
      setState(prev => ({
        ...prev,
        produits: prev.produits.map(produit => 
          produit.id === id ? updatedProduitList : produit
        ),
        currentProduit: response.produit,
        // Mettre à jour aussi dans les catégories
        categories: prev.categories.map(categorie => {
          if (categorie.id === response.produit.categorie) {
            return {
              ...categorie,
              produits: categorie.produits.map(p => 
                p.id === id ? updatedProduitList : p
              ),
            };
          }
          return categorie;
        }),
        detailLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour du produit",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const deleteProduit = useCallback(async (id: number): Promise<SimpleMessageResponse> => {
    try {
      const produit = state.produits.find(p => p.id === id);
      
      const response = await productsApi.deleteProduit(id);
      
      // Retirer de la liste
      setState(prev => ({
        ...prev,
        produits: prev.produits.filter(produit => produit.id !== id),
        produitsCount: prev.produitsCount - 1,
        currentProduit: prev.currentProduit?.id === id ? null : prev.currentProduit,
        // Mettre à jour le compteur dans la catégorie
        categories: prev.categories.map(categorie => {
          if (produit && categorie.id === produit.categorie) {
            return {
              ...categorie,
              nombre_produits: categorie.nombre_produits - 1,
              produits: categorie.produits.filter(p => p.id !== id),
            };
          }
          return categorie;
        }),
      }));
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }, [state.produits]);

  // ========== UTILITIES ==========
  
  const clearCurrentCategorie = useCallback(() => {
    setState(prev => ({ ...prev, currentCategorie: null }));
  }, []);

  const clearCurrentProduit = useCallback(() => {
    setState(prev => ({ ...prev, currentProduit: null }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      categoriesError: null,
      produitsError: null,
      detailError: null,
    }));
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchCategories(),
      fetchProduits(),
    ]);
  }, [fetchCategories, fetchProduits]);

  // ========== COMPUTED VALUES ==========
  
  const getCategoriesActives = useCallback(() => {
    return state.categories.filter(c => c.actif);
  }, [state.categories]);

  const getProduitsParCategorie = useCallback((categorieId: number) => {
    return state.produits.filter(p => p.categorie === categorieId);
  }, [state.produits]);

  const getProduitsActifs = useCallback(() => {
    return state.produits.filter(p => p.actif);
  }, [state.produits]);

  const getProduitsInactifs = useCallback(() => {
    return state.produits.filter(p => !p.actif);
  }, [state.produits]);

  const getProduitsSansPhoto = useCallback(() => {
    // Dans la liste, on n'a pas l'info photo, besoin de fetch détaillé
    return [];
  }, []);

  return {
    // State
    ...state,
    
    // Catégories
    fetchCategories,
    fetchCategorie,
    createCategorie,
    updateCategorie,
    patchCategorie,
    deleteCategorie,
    
    // Produits
    fetchProduits,
    fetchProduit,
    createProduit,
    updateProduit,
    patchProduit,
    deleteProduit,
    
    // Utilities
    clearCurrentCategorie,
    clearCurrentProduit,
    clearErrors,
    refreshAll,
    
    // Computed values
    categoriesActives: getCategoriesActives(),
    produitsParCategorie: getProduitsParCategorie,
    produitsActifs: getProduitsActifs(),
    produitsInactifs: getProduitsInactifs(),
    
    // Stats
    stats: {
      totalCategories: state.categoriesCount,
      totalProduits: state.produitsCount,
      categoriesActives: getCategoriesActives().length,
      categoriesInactives: state.categoriesCount - getCategoriesActives().length,
      produitsActifs: getProduitsActifs().length,
      produitsInactifs: getProduitsInactifs().length,
    },
  };
}