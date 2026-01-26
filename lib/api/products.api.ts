/**
 * =====================================================
 * API Client - Produits
 * =====================================================
 * Client pour les endpoints de gestion des produits
 * 
 * @module lib/api/products.api
 * @version 1.0
 */

import { apiClient } from "./client";
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

export class ProductsApi {
  private client = apiClient;

  /**
   * Liste tous les produits
   * GET /produits
   */
  async list(params?: ProduitListParams): Promise<ProduitListResponse> {
    const queryParams: Record<string, string | number | boolean> = {};
    
    if (params?.categorie_id !== undefined) {
      queryParams.categorie_id = params.categorie_id;
    }
    if (params?.actif !== undefined) {
      queryParams.actif = params.actif;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    return this.client.get<ProduitListResponse>("/produits", queryParams);
  }

  /**
   * Récupère les détails d'un produit
   * GET /produits/{id}
   */
  async get(id: number): Promise<ProduitDetail> {
    return this.client.get<ProduitDetail>(`/produits/${id}`);
  }

  /**
   * Crée un nouveau produit
   * POST /produits
   * Requiert: Admin uniquement
   * Content-Type: multipart/form-data si photo fournie
   */
  async create(data: ProduitCreateRequest): Promise<ProduitCreateResponse> {
    const formData = new FormData();
    
    formData.append('categorie_id', data.categorie_id.toString());
    formData.append('nom', data.nom);
    formData.append('marque', data.marque);
    if (data.volume) formData.append('volume', data.volume);
    formData.append('unite_vente', data.unite_vente);
    formData.append('prix_unitaire', data.prix_unitaire.toString());
    if (data.photo) formData.append('photo', data.photo);
    if (data.actif !== undefined) formData.append('actif', data.actif.toString());

    return this.client.post<ProduitCreateResponse>("/produits", formData);
  }

  /**
   * Modifie un produit (complet)
   * PUT /produits/{id}
   * Requiert: Admin uniquement
   */
  async update(id: number, data: ProduitUpdateRequest): Promise<ProduitUpdateResponse> {
    const formData = new FormData();
    
    if (data.categorie_id !== undefined) formData.append('categorie_id', data.categorie_id.toString());
    if (data.nom) formData.append('nom', data.nom);
    if (data.marque) formData.append('marque', data.marque);
    if (data.volume !== undefined) formData.append('volume', data.volume || '');
    if (data.unite_vente) formData.append('unite_vente', data.unite_vente);
    if (data.prix_unitaire !== undefined) formData.append('prix_unitaire', data.prix_unitaire.toString());
    if (data.photo) formData.append('photo', data.photo);
    if (data.actif !== undefined) formData.append('actif', data.actif.toString());

    return this.client.put<ProduitUpdateResponse>(`/produits/${id}`, formData);
  }

  /**
   * Modifie partiellement un produit
   * PATCH /produits/{id}
   * Requiert: Admin uniquement
   */
  async patch(id: number, data: Partial<ProduitUpdateRequest>): Promise<ProduitUpdateResponse> {
    const formData = new FormData();
    
    if (data.categorie_id !== undefined) formData.append('categorie_id', data.categorie_id.toString());
    if (data.nom) formData.append('nom', data.nom);
    if (data.marque) formData.append('marque', data.marque);
    if (data.volume !== undefined) formData.append('volume', data.volume || '');
    if (data.unite_vente) formData.append('unite_vente', data.unite_vente);
    if (data.prix_unitaire !== undefined) formData.append('prix_unitaire', data.prix_unitaire.toString());
    if (data.photo) formData.append('photo', data.photo);
    if (data.actif !== undefined) formData.append('actif', data.actif.toString());

    return this.client.patch<ProduitUpdateResponse>(`/produits/${id}`, formData);
  }

  /**
   * Supprime un produit
   * DELETE /produits/{id}
   * Requiert: Admin uniquement
   */
  async delete(id: number): Promise<ProduitDeleteResponse> {
    return this.client.delete<ProduitDeleteResponse>(`/produits/${id}`);
  }
}

// Instance singleton exportée
export const productsApi = new ProductsApi();