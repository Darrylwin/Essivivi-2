/**
 * =====================================================
 * API Client - Gestion des Catégories & Produits (Admin)
 * =====================================================
 * Client pour les endpoints du catalogue produits
 * 
 * @module lib/api/products.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  // Types de base
  CategorieAvecProduits,
  CategorieCreateRequest,
  CategorieUpdateRequest,
  CategorieAvecProduitsResponse,
  CategorieDetailResponse,
  ProduitDetail,
  ProduitCreateRequest,
  ProduitUpdateRequest,
  ProduitListResponse,
  ProduitDetailResponse,
  SimpleMessageResponse,
  CategorieQueryParams,
  ProduitQueryParams,
} from "../types";

export class ProductsApi {
  private client = apiClient;

  // ========== CATÉGORIES ==========
  
  /**
   * Liste toutes les catégories
   * GET /categories
   */
  async getCategories(params?: CategorieQueryParams): Promise<CategorieAvecProduitsResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params?.actif !== undefined) {
      queryParams.actif = params.actif.toString();
    }
    
    if (params?.avec_produits !== undefined) {
      queryParams.avec_produits = params.avec_produits.toString();
    }
    
    return this.client.get<CategorieAvecProduitsResponse>("/categories", queryParams);
  }

  /**
   * Créer une catégorie
   * POST /categories
   */
  async createCategorie(data: CategorieCreateRequest): Promise<CategorieDetailResponse> {
    return this.client.post<CategorieDetailResponse>("/categories", data);
  }

  /**
   * Détails d'une catégorie
   * GET /categories/{id}
   */
  async getCategorie(id: number): Promise<CategorieAvecProduits> {
    return this.client.get<CategorieAvecProduits>(`/categories/${id}`);
  }

  /**
   * Modifier une catégorie (PUT - modification complète)
   * PUT /categories/{id}
   */
  async updateCategorie(id: number, data: CategorieUpdateRequest): Promise<CategorieDetailResponse> {
    return this.client.put<CategorieDetailResponse>(
      `/categories/${id}`,
      data
    );
  }

  /**
   * Modifier partiellement une catégorie (PATCH)
   * PATCH /categories/{id}
   */
  async patchCategorie(id: number, data: CategorieUpdateRequest): Promise<CategorieDetailResponse> {
    return this.client.patch<CategorieDetailResponse>(
      `/categories/${id}`,
      data
    );
  }

  /**
   * Supprimer une catégorie
   * DELETE /categories/{id}
   */
  async deleteCategorie(id: number): Promise<SimpleMessageResponse> {
    return this.client.delete<SimpleMessageResponse>(`/categories/${id}`);
  }

  // ========== PRODUITS ==========
  
  /**
   * Liste tous les produits
   * GET /produits
   */
  async getProduits(params?: ProduitQueryParams): Promise<ProduitListResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params?.categorie_id !== undefined) {
      queryParams.categorie_id = params.categorie_id.toString();
    }
    
    if (params?.actif !== undefined) {
      queryParams.actif = params.actif.toString();
    }
    
    if (params?.search) {
      queryParams.search = params.search;
    }
    
    return this.client.get<ProduitListResponse>("/produits", queryParams);
  }

  /**
   * Créer un produit
   * POST /produits
   */
  async createProduit(data: ProduitCreateRequest): Promise<ProduitDetailResponse> {
    // Pour les uploads avec fichiers, utiliser FormData
    const formData = new FormData();
    
    // Champs obligatoires
    formData.append("categorie_id", data.categorie_id.toString());
    formData.append("nom", data.nom);
    formData.append("marque", data.marque);
    formData.append("unite_vente", data.unite_vente);
    formData.append("prix_unitaire", data.prix_unitaire.toString());
    
    // Champs optionnels
    if (data.volume !== undefined) {
      formData.append("volume", data.volume || "");
    }
    
    if (data.photo) {
      formData.append("photo", data.photo);
    }
    
    if (data.actif !== undefined) {
      formData.append("actif", data.actif.toString());
    }
    
    return this.client.post<ProduitDetailResponse>(
      "/produits",
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Détails d'un produit
   * GET /produits/{id}
   */
  async getProduit(id: number): Promise<ProduitDetail> {
    return this.client.get<ProduitDetail>(`/produits/${id}`);
  }

  /**
   * Modifier un produit (PUT - modification complète)
   * PUT /produits/{id}
   */
  async updateProduit(id: number, data: ProduitUpdateRequest): Promise<ProduitDetailResponse> {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.categorie_id !== undefined) {
      formData.append("categorie_id", data.categorie_id.toString());
    }
    
    if (data.nom) {
      formData.append("nom", data.nom);
    }
    
    if (data.marque) {
      formData.append("marque", data.marque);
    }
    
    if (data.unite_vente) {
      formData.append("unite_vente", data.unite_vente);
    }
    
    if (data.prix_unitaire !== undefined) {
      formData.append("prix_unitaire", data.prix_unitaire.toString());
    }
    
    if (data.volume !== undefined) {
      formData.append("volume", data.volume || "");
    }
    
    if (data.actif !== undefined) {
      formData.append("actif", data.actif.toString());
    }
    
    if (data.photo !== undefined) {
      if (data.photo) {
        formData.append("photo", data.photo);
      } else {
        // Pour supprimer la photo
        formData.append("photo", "");
      }
    }
    
    return this.client.put<ProduitDetailResponse>(
      `/produits/${id}`,
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Modifier partiellement un produit (PATCH)
   * PATCH /produits/{id}
   */
  async patchProduit(id: number, data: ProduitUpdateRequest): Promise<ProduitDetailResponse> {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.categorie_id !== undefined) {
      formData.append("categorie_id", data.categorie_id.toString());
    }
    
    if (data.nom) {
      formData.append("nom", data.nom);
    }
    
    if (data.marque) {
      formData.append("marque", data.marque);
    }
    
    if (data.unite_vente) {
      formData.append("unite_vente", data.unite_vente);
    }
    
    if (data.prix_unitaire !== undefined) {
      formData.append("prix_unitaire", data.prix_unitaire.toString());
    }
    
    if (data.volume !== undefined) {
      formData.append("volume", data.volume || "");
    }
    
    if (data.actif !== undefined) {
      formData.append("actif", data.actif.toString());
    }
    
    if (data.photo !== undefined) {
      if (data.photo) {
        formData.append("photo", data.photo);
      } else {
        // Pour supprimer la photo
        formData.append("photo", "");
      }
    }
    
    return this.client.patch<ProduitDetailResponse>(
      `/produits/${id}`,
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Supprimer un produit
   * DELETE /produits/{id}
   */
  async deleteProduit(id: number): Promise<SimpleMessageResponse> {
    return this.client.delete<SimpleMessageResponse>(`/produits/${id}`);
  }
}

// Instance singleton exportée
export const productsApi = new ProductsApi();