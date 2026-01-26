/**
 * =====================================================
 * API Client - Tournées & Livraisons
 * =====================================================
 * Client pour les endpoints de gestion des tournées et livraisons
 * 
 * @module lib/api/tours-deliveries.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  TourneeListResponse,
  Tournee,
  TourneeListParams,
  LivraisonListResponse,
  Livraison,
  LivraisonListParams,
} from "../types";

export class ToursApi {
  private client = apiClient;

  /**
   * Liste toutes les tournées
   * GET /tours
   * Filtrage automatique: Agent voit ses tournées, Admin voit toutes
   */
  async list(params?: TourneeListParams): Promise<TourneeListResponse> {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.agent_id !== undefined) {
      queryParams.agent_id = params.agent_id;
    }
    if (params?.date) {
      queryParams.date = params.date;
    }

    return this.client.get<TourneeListResponse>("/tours", queryParams);
  }

  /**
   * Récupère les détails d'une tournée
   * GET /tours/{id}
   */
  async get(id: number): Promise<Tournee> {
    return this.client.get<Tournee>(`/tours/${id}`);
  }
}

export class DeliveriesApi {
  private client = apiClient;

  /**
   * Liste toutes les livraisons
   * GET /deliveries
   * Filtrage automatique selon l'utilisateur
   */
  async list(params?: LivraisonListParams): Promise<LivraisonListResponse> {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.date) {
      queryParams.date = params.date;
    }
    if (params?.client_id !== undefined) {
      queryParams.client_id = params.client_id;
    }
    if (params?.agent_id !== undefined) {
      queryParams.agent_id = params.agent_id;
    }
    if (params?.commande_id !== undefined) {
      queryParams.commande_id = params.commande_id;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    return this.client.get<LivraisonListResponse>("/deliveries", queryParams);
  }

  /**
   * Récupère les détails d'une livraison
   * GET /deliveries/{id}
   */
  async get(id: number): Promise<Livraison> {
    return this.client.get<Livraison>(`/deliveries/${id}`);
  }

  /**
   * Supprime une livraison
   * DELETE /deliveries/{id}
   * Requiert: Admin uniquement
   */
  async delete(id: number): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/deliveries/${id}`);
  }
}

// Instances singleton exportées
export const toursApi = new ToursApi();
export const deliveriesApi = new DeliveriesApi();