/**
 * =====================================================
 * API Client - Commandes
 * =====================================================
 * Client pour les endpoints de gestion des commandes
 * 
 * @module lib/api/orders.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  CommandeListResponse,
  Commande,
  CommandeAssignRequest,
  CommandeAssignResponse,
  CommandeStatusRequest,
  CommandeStatusResponse,
  AgentsDisponiblesResponse,
  CommandeListParams,
} from "../types";

export class OrdersApi {
  private client = apiClient;

  /**
   * Liste toutes les commandes
   * GET /orders
   * Filtrage automatique selon l'utilisateur
   */
  async list(params?: CommandeListParams): Promise<CommandeListResponse> {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.statut) {
      queryParams.statut = params.statut;
    }
    if (params?.agent_id !== undefined) {
      queryParams.agent_id = params.agent_id;
    }
    if (params?.client_id !== undefined) {
      queryParams.client_id = params.client_id;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    return this.client.get<CommandeListResponse>("/orders", queryParams);
  }

  /**
   * Récupère les détails d'une commande
   * GET /orders/{id}
   */
  async get(id: number): Promise<Commande> {
    return this.client.get<Commande>(`/orders/${id}`);
  }

  /**
   * Assigne une commande à un agent
   * POST /orders/{id}/assign
   * Requiert: Admin uniquement
   */
  async assign(id: number, data: CommandeAssignRequest): Promise<CommandeAssignResponse> {
    return this.client.post<CommandeAssignResponse>(`/orders/${id}/assign`, data);
  }

  /**
   * Change le statut d'une commande
   * PATCH /orders/{id}/status
   * Requiert: Admin ou Agent assigné
   */
  async updateStatus(id: number, data: CommandeStatusRequest): Promise<CommandeStatusResponse> {
    return this.client.patch<CommandeStatusResponse>(`/orders/${id}/status`, data);
  }

  /**
   * Supprime une commande
   * DELETE /orders/{id}
   * Requiert: Admin uniquement
   */
  async delete(id: number): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/orders/${id}`);
  }

  /**
   * Liste des agents disponibles pour assignation
   * GET /orders/available-agents
   * Requiert: Admin uniquement
   */
  async getAvailableAgents(): Promise<AgentsDisponiblesResponse> {
    return this.client.get<AgentsDisponiblesResponse>("/orders/available-agents");
  }
}

// Instance singleton exportée
export const ordersApi = new OrdersApi();