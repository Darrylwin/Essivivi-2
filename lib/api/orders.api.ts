// orders.api.ts
/**
 * =====================================================
 * API Client - Commandes (Orders)
 * =====================================================
 * Client pour les endpoints de gestion des commandes (admin web)
 * 
 * @module lib/api/orders.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  CommandeListRequest,
  CommandeListResponse,
  CommandeDetailResponse,
  CommandeAssignRequest,
  CommandeAssignResponse,
  CommandeStatusRequest,
  CommandeStatusResponse,
  CommandeUpdateRequest,
  CommandeUpdateResponse,
  NotificationListRequest,
  NotificationListResponse,
  NotificationMarkAsReadResponse,
} from "../types";

export class OrdersApi {
  private client = apiClient;

  // ==================== COMMANDES ====================

  /**
   * Lister les commandes
   * GET /orders
   * Requiert: Bearer token (admin)
   */
  async listCommandes(filters?: CommandeListRequest): Promise<CommandeListResponse> {
    const params: Record<string, string> = {};
    
    if (filters?.statut) params.statut = filters.statut;
    if (filters?.search) params.search = filters.search;
    if (filters?.agent_id) params.agent_id = String(filters.agent_id);
    if (filters?.client_id) params.client_id = String(filters.client_id);
    if (filters?.lat) params.lat = String(filters.lat);
    if (filters?.lon) params.lon = String(filters.lon);
    if (filters?.distance_max) params.distance_max = String(filters.distance_max);

    return this.client.get<CommandeListResponse>("/orders", params);
  }

  /**
   * Récupérer les détails d'une commande
   * GET /orders/{id}
   * Requiert: Bearer token (admin, agent assigné, ou client propriétaire)
   */
  async getCommande(id: number): Promise<CommandeDetailResponse> {
    return this.client.get<CommandeDetailResponse>(`/orders/${id}`);
  }

  /**
   * Mettre à jour une commande (coordonnées)
   * PUT /orders/{id}
   * Requiert: Bearer token (admin ou client si statut en_attente)
   */
  async updateCommande(id: number, data: CommandeUpdateRequest): Promise<CommandeUpdateResponse> {
    return this.client.put<CommandeUpdateResponse>(`/orders/${id}`, data);
  }

  /**
   * Mettre à jour partiellement une commande
   * PATCH /orders/{id}
   * Requiert: Bearer token (admin ou client si statut en_attente)
   */
  async patchCommande(id: number, data: CommandeUpdateRequest): Promise<CommandeUpdateResponse> {
    return this.client.patch<CommandeUpdateResponse>(`/orders/${id}`, data);
  }

  /**
   * Supprimer une commande
   * DELETE /orders/{id}
   * Requiert: Bearer token (admin uniquement)
   */
  async deleteCommande(id: number): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/orders/${id}`);
  }

  /**
   * Assigner une commande à un agent
   * POST /orders/{id}/assign
   * Requiert: Bearer token (admin uniquement)
   */
  async assignCommande(id: number, data: CommandeAssignRequest): Promise<CommandeAssignResponse> {
    return this.client.post<CommandeAssignResponse>(`/orders/${id}/assign`, data);
  }

  /**
   * Changer le statut d'une commande
   * PATCH /orders/{id}/status
   * Requiert: Bearer token (admin ou agent assigné)
   */
  async changeCommandeStatus(id: number, data: CommandeStatusRequest): Promise<CommandeStatusResponse> {
    return this.client.patch<CommandeStatusResponse>(`/orders/${id}/status`, data);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Lister les notifications
   * GET /notifications
   * Requiert: Bearer token
   */
  async listNotifications(filters?: NotificationListRequest): Promise<NotificationListResponse> {
    const params: Record<string, string> = {};
    
    if (filters?.lue !== undefined) params.lue = String(filters.lue);

    return this.client.get<NotificationListResponse>("/notifications", params);
  }

  /**
   * Marquer une notification comme lue
   * PATCH /notifications/{id}/read
   * Requiert: Bearer token (propriétaire de la notification)
   */
  async markNotificationAsRead(id: number): Promise<NotificationMarkAsReadResponse> {
    return this.client.patch<NotificationMarkAsReadResponse>(`/notifications/${id}/read`);
  }
}

// Instance singleton exportée
export const ordersApi = new OrdersApi();