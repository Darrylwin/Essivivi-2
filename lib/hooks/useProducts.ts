/**
 * =====================================================
 * Hook - Produits
 * =====================================================
 * Hook React pour la gestion des produits
 * 
 * @module lib/hooks/useProducts
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { productsApi } from "../api";
import type {
  ProduitListResponse,
  ProduitDetail,
  ProduitCreateRequest,
  ProduitCreateResponse,
  ProduitUpdateRequest,
  ProduitUpdateResponse,
  ProduitDeleteResponse,
  ProduitListParams,
} from "../types";

interface UseProductsReturn {
  produits: ProduitListResponse | null;
  produit: ProduitDetail | null;
  loading: boolean;
  error: string | null;

  fetchProduits: (params?: ProduitListParams) => Promise<void>;
  fetchProduit: (id: number) => Promise<void>;
  createProduit: (data: ProduitCreateRequest) => Promise<ProduitCreateResponse>;
  updateProduit: (id: number, data: ProduitUpdateRequest) => Promise<ProduitUpdateResponse>;
  patchProduit: (id: number, data: Partial<ProduitUpdateRequest>) => Promise<ProduitUpdateResponse>;
  deleteProduit: (id: number) => Promise<ProduitDeleteResponse>;

  clearProduit: () => void;
  clearError: () => void;
}

export function useProducts(): UseProductsReturn {
  const [produits, setProduits] = useState<ProduitListResponse | null>(null);
  const [produit, setProduit] = useState<ProduitDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduits = useCallback(async (params?: ProduitListParams): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.list(params);
      setProduits(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduit = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.get(id);
      setProduit(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch product";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduit = useCallback(async (data: ProduitCreateRequest): Promise<ProduitCreateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.create(data);
      
      // Update products list if it exists
      if (produits?.results) {
        setProduits(prev => ({
          count: (prev?.count ?? 0) + 1,
          results: [...(prev?.results ?? []), {
            id: response.produit.id,
            nom: response.produit.nom,
            marque: response.produit.marque,
            volume: response.produit.volume,
            unite_vente: response.produit.unite_vente,
            prix_unitaire: response.produit.prix_unitaire,
            categorie: response.produit.categorie,
            categorie_nom: response.produit.categorie_detail.nom,
            actif: response.produit.actif,
          }]
        }));
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create product";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [produits]);

  const updateProduit = useCallback(async (id: number, data: ProduitUpdateRequest): Promise<ProduitUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.update(id, data);
      
      // Update current product if it's the same
      if (produit?.id === id) {
        setProduit(response.produit);
      }
      
      // Update products list if it exists
      if (produits?.results) {
        setProduits(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom && { nom: data.nom }),
                ...(data.marque && { marque: data.marque }),
                ...(data.volume !== undefined && { volume: data.volume }),
                ...(data.unite_vente && { unite_vente: data.unite_vente }),
                ...(data.prix_unitaire !== undefined && { prix_unitaire: data.prix_unitaire.toString() }),
                ...(data.categorie_id !== undefined && { 
                  categorie: data.categorie_id,
                  categorie_nom: response.produit.categorie_detail.nom 
                }),
                ...(data.actif !== undefined && { actif: data.actif }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [produit, produits]);

  const patchProduit = useCallback(async (id: number, data: Partial<ProduitUpdateRequest>): Promise<ProduitUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.patch(id, data);
      
      // Update current product if it's the same
      if (produit?.id === id) {
        setProduit(response.produit);
      }
      
      // Update products list if it exists
      if (produits?.results) {
        setProduits(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom && { nom: data.nom }),
                ...(data.marque && { marque: data.marque }),
                ...(data.volume !== undefined && { volume: data.volume }),
                ...(data.unite_vente && { unite_vente: data.unite_vente }),
                ...(data.prix_unitaire !== undefined && { prix_unitaire: data.prix_unitaire.toString() }),
                ...(data.categorie_id !== undefined && { 
                  categorie: data.categorie_id,
                  categorie_nom: response.produit.categorie_detail.nom 
                }),
                ...(data.actif !== undefined && { actif: data.actif }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to patch product";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [produit, produits]);

  const deleteProduit = useCallback(async (id: number): Promise<ProduitDeleteResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.delete(id);
      
      // Remove from products list if it exists
      if (produits?.results) {
        setProduits(prev => ({
          count: (prev?.count ?? 1) - 1,
          results: (prev?.results ?? []).filter(item => item.id !== id)
        }));
      }
      
      // Clear current product if it's the same
      if (produit?.id === id) {
        setProduit(null);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [produit, produits]);

  const clearProduit = useCallback(() => {
    setProduit(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    produits,
    produit,
    loading,
    error,

    fetchProduits,
    fetchProduit,
    createProduit,
    updateProduit,
    patchProduit,
    deleteProduit,

    clearProduit,
    clearError,
  };
}