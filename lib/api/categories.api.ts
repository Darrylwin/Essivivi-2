/**
 * =====================================================
 * API Client - Catégories
 * =====================================================
 * Client pour les endpoints de gestion des catégories
 * 
 * @module lib/api/categories.api
 * @version 1.0
 */

import { apiClient } from "./client";
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

export class CategoriesApi {
  private client = apiClient;

  /**
   * Liste toutes les catégories
   * GET /categories
   */
  async list(params?: CategorieListParams): Promise<CategorieListResponse> {
    const queryParams: Record<string, string | boolean> = {};
    
    if (params?.actif !== undefined) {
      queryParams.actif = params.actif;
    }
    if (params?.avec_produits !== undefined) {
      queryParams.avec_produits = params.avec_produits;
    }

    return this.client.get<CategorieListResponse>("/categories", queryParams);
  }

  /**
   * Récupère les détails d'une catégorie
   * GET /categories/{id}
   */
  async get(id: number): Promise<CategorieDetailResponse> {
    return this.client.get<CategorieDetailResponse>(`/categories/${id}`);
  }

  /**
   * Crée une nouvelle catégorie
   * POST /categories
   * Requiert: Admin uniquement
   */
  async create(data: CategorieCreateRequest): Promise<CategorieCreateResponse> {
    return this.client.post<CategorieCreateResponse>("/categories", data);
  }

  /**
   * Modifie une catégorie (complète)
   * PUT /categories/{id}
   * Requiert: Admin uniquement
   */
  async update(id: number, data: CategorieUpdateRequest): Promise<CategorieUpdateResponse> {
    return this.client.put<CategorieUpdateResponse>(`/categories/${id}`, data);
  }

  /**
   * Modifie partiellement une catégorie
   * PATCH /categories/{id}
   * Requiert: Admin uniquement
   */
  async patch(id: number, data: Partial<CategorieUpdateRequest>): Promise<CategorieUpdateResponse> {
    return this.client.patch<CategorieUpdateResponse>(`/categories/${id}`, data);
  }

  /**
   * Supprime une catégorie
   * DELETE /categories/{id}
   * Requiert: Admin uniquement
   */
  async delete(id: number): Promise<CategorieDeleteResponse> {
    return this.client.delete<CategorieDeleteResponse>(`/categories/${id}`);
  }
}

// Instance singleton exportée
export const categoriesApi = new CategoriesApi();