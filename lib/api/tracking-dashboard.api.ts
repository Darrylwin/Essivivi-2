/**
 * =====================================================
 * API Client - Tracking & Dashboard
 * =====================================================
 * Client pour les endpoints de tracking GPS et dashboard
 * 
 * @module lib/api/tracking-dashboard.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  PositionAgent,
  PositionListParams,
  AgentEnTournee,
  ParcoursAgent,
  DashboardStats,
} from "../types";

export class TrackingApi {
  private client = apiClient;

  /**
   * Liste les positions GPS
   * GET /tracking/agents/positions
   * Filtrage: Agent voit ses positions, Admin voit toutes
   */
  async listPositions(params?: PositionListParams): Promise<PositionAgent[]> {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.agent_id !== undefined) {
      queryParams.agent_id = params.agent_id;
    }
    if (params?.date) {
      queryParams.date = params.date;
    }
    if (params?.heure_debut) {
      queryParams.heure_debut = params.heure_debut;
    }
    if (params?.heure_fin) {
      queryParams.heure_fin = params.heure_fin;
    }

    return this.client.get<PositionAgent[]>("/tracking/agents/positions", queryParams);
  }

  /**
   * Récupère une position
   * GET /tracking/agents/positions/{id}
   */
  async getPosition(id: number): Promise<PositionAgent> {
    return this.client.get<PositionAgent>(`/tracking/agents/positions/${id}`);
  }

  /**
   * Liste tous les agents en tournée avec leur dernière position
   * GET /tracking/admin/live/agents
   * Requiert: Admin uniquement
   */
  async getAgentsEnTournee(): Promise<AgentEnTournee[]> {
    return this.client.get<AgentEnTournee[]>("/tracking/admin/live/agents");
  }

  /**
   * Récupère le parcours complet d'une tournée
   * GET /tracking/agents/{agent_id}/parcours?tournee_id={tournee_id}
   */
  async getParcours(agentId: number, tourneeId: number): Promise<ParcoursAgent> {
    return this.client.get<ParcoursAgent>(
      `/tracking/agents/${agentId}/parcours`,
      { tournee_id: tourneeId }
    );
  }
}

export class DashboardApi {
  private client = apiClient;

  /**
   * Récupère les statistiques du dashboard
   * GET /admin/dashboard
   * Requiert: Admin uniquement
   */
  async getStats(): Promise<DashboardStats> {
    return this.client.get<DashboardStats>("/admin/dashboard");
  }
}

// Instances singleton exportées
export const trackingApi = new TrackingApi();
export const dashboardApi = new DashboardApi();