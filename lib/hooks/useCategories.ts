/**
 * =====================================================
 * Hook - Catégories
 * =====================================================
 * Hook React pour la gestion des catégories de produits
 * 
 * @module lib/hooks/useCategories
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { categoriesApi } from "../api";
import type {
  CategorieListResponse,
  CategorieDetailResponse,
  CategorieCreateRequest,
  CategorieCreateResponse,
  CategorieUpdateRequest,
  CategorieUpdateResponse,
  CategorieDeleteResponse,
  CategorieListParams,
} from "../types";

interface UseCategoriesReturn {
  categories: CategorieListResponse | null;
  categorie: CategorieDetailResponse | null;
  loading: boolean;
  error: string | null;

  fetchCategories: (params?: CategorieListParams) => Promise<void>;
  fetchCategorie: (id: number) => Promise<void>;
  createCategorie: (data: CategorieCreateRequest) => Promise<CategorieCreateResponse>;
  updateCategorie: (id: number, data: CategorieUpdateRequest) => Promise<CategorieUpdateResponse>;
  patchCategorie: (id: number, data: Partial<CategorieUpdateRequest>) => Promise<CategorieUpdateResponse>;
  deleteCategorie: (id: number) => Promise<CategorieDeleteResponse>;

  clearCategorie: () => void;
  clearError: () => void;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategorieListResponse | null>(null);
  const [categorie, setCategorie] = useState<CategorieDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (params?: CategorieListParams): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.list(params);
      setCategories(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategorie = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.get(id);
      setCategorie(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch category";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategorie = useCallback(async (data: CategorieCreateRequest): Promise<CategorieCreateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.create(data);
      
      // Update categories list if it exists
      if (categories?.results) {
        setCategories(prev => ({
          count: (prev?.count ?? 0) + 1,
          results: [...(prev?.results ?? []), {
            id: response.categorie.id,
            nom: response.categorie.nom,
            actif: response.categorie.actif,
            nombre_produits: response.categorie.nombre_produits,
          }]
        }));
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const updateCategorie = useCallback(async (id: number, data: CategorieUpdateRequest): Promise<CategorieUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.update(id, data);
      
      // Update current category if it's the same
      if (categorie?.id === id) {
        setCategorie(response.categorie);
      }
      
      // Update categories list if it exists
      if (categories?.results) {
        setCategories(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom && { nom: data.nom }),
                ...(data.actif !== undefined && { actif: data.actif }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update category";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categorie, categories]);

  const patchCategorie = useCallback(async (id: number, data: Partial<CategorieUpdateRequest>): Promise<CategorieUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.patch(id, data);
      
      // Update current category if it's the same
      if (categorie?.id === id) {
        setCategorie(response.categorie);
      }
      
      // Update categories list if it exists
      if (categories?.results) {
        setCategories(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom && { nom: data.nom }),
                ...(data.actif !== undefined && { actif: data.actif }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to patch category";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categorie, categories]);

  const deleteCategorie = useCallback(async (id: number): Promise<CategorieDeleteResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.delete(id);
      
      // Remove from categories list if it exists
      if (categories?.results) {
        setCategories(prev => ({
          count: (prev?.count ?? 1) - 1,
          results: (prev?.results ?? []).filter(item => item.id !== id)
        }));
      }
      
      // Clear current category if it's the same
      if (categorie?.id === id) {
        setCategorie(null);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete category";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categorie, categories]);

  const clearCategorie = useCallback(() => {
    setCategorie(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    categories,
    categorie,
    loading,
    error,

    fetchCategories,
    fetchCategorie,
    createCategorie,
    updateCategorie,
    patchCategorie,
    deleteCategorie,

    clearCategorie,
    clearError,
  };
}