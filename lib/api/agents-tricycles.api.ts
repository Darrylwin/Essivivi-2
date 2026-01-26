/**
 * =====================================================
 * API Client - Agents & Tricycles
 * =====================================================
 * Client pour les endpoints de gestion des agents et tricycles
 * 
 * @module lib/api/agents-tricycles.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  Tricycle,
  TricycleCreateRequest,
  TricycleUpdateRequest,
  AgentListResponse,
  Agent,
  AgentCreateRequest,
  AgentCreateResponse,
  AgentUpdateRequest,
  AgentUpdateResponse,
  AgentDeleteResponse,
  AgentListParams,
} from "../types";

export class TricyclesApi {
  private client = apiClient;

  /**
   * Liste tous les tricycles
   * GET /tricycles
   */
  async list(): Promise<Tricycle[]> {
    return this.client.get<Tricycle[]>("/tricycles");
  }

  /**
   * Récupère un tricycle
   * GET /tricycles/{id}
   */
  async get(id: number): Promise<Tricycle> {
    return this.client.get<Tricycle>(`/tricycles/${id}`);
  }

  /**
   * Crée un tricycle
   * POST /tricycles
   */
  async create(data: TricycleCreateRequest): Promise<Tricycle> {
    return this.client.post<Tricycle>("/tricycles", data);
  }

  /**
   * Modifie un tricycle
   * PUT /tricycles/{id}
   */
  async update(id: number, data: TricycleUpdateRequest): Promise<Tricycle> {
    return this.client.put<Tricycle>(`/tricycles/${id}`, data);
  }

  /**
   * Supprime un tricycle
   * DELETE /tricycles/{id}
   */
  async delete(id: number): Promise<void> {
    return this.client.delete<void>(`/tricycles/${id}`);
  }
}

export class AgentsApi {
  private client = apiClient;

  /**
   * Liste tous les agents
   * GET /admin/agents
   */
  async list(params?: AgentListParams): Promise<AgentListResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params?.statut) {
      queryParams.statut = params.statut;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    return this.client.get<AgentListResponse>("/admin/agents", queryParams);
  }

  /**
   * Récupère les détails d'un agent
   * GET /admin/agents/{id}
   */
  async get(id: number): Promise<Agent> {
    return this.client.get<Agent>(`/admin/agents/${id}`);
  }

  /**
   * Crée un nouvel agent
   * POST /admin/agents
   * Content-Type: multipart/form-data si photo fournie
   */
  async create(data: AgentCreateRequest): Promise<AgentCreateResponse> {
    const formData = new FormData();
    
    formData.append('nom', data.nom);
    formData.append('prenom', data.prenom);
    formData.append('telephone', data.telephone);
    formData.append('email', data.email);
    formData.append('date_naissance', data.date_naissance);
    formData.append('adresse', data.adresse);
    if (data.photo) formData.append('photo', data.photo);
    if (data.tricycle_id !== undefined) {
      formData.append('tricycle_id', data.tricycle_id === null ? '' : data.tricycle_id.toString());
    }
    if (data.mot_de_passe) formData.append('mot_de_passe', data.mot_de_passe);

    return this.client.post<AgentCreateResponse>("/admin/agents", formData);
  }

  /**
   * Modifie un agent (complet)
   * PUT /admin/agents/{id}
   */
  async update(id: number, data: AgentUpdateRequest): Promise<AgentUpdateResponse> {
    const formData = new FormData();
    
    if (data.nom) formData.append('nom', data.nom);
    if (data.prenom) formData.append('prenom', data.prenom);
    if (data.telephone) formData.append('telephone', data.telephone);
    if (data.email) formData.append('email', data.email);
    if (data.date_naissance) formData.append('date_naissance', data.date_naissance);
    if (data.adresse) formData.append('adresse', data.adresse);
    if (data.photo) formData.append('photo', data.photo);
    if (data.tricycle_id !== undefined) {
      formData.append('tricycle_id', data.tricycle_id === null ? '' : data.tricycle_id.toString());
    }
    if (data.statut) formData.append('statut', data.statut);

    return this.client.put<AgentUpdateResponse>(`/admin/agents/${id}`, formData);
  }

  /**
   * Modifie partiellement un agent
   * PATCH /admin/agents/{id}
   */
  async patch(id: number, data: Partial<AgentUpdateRequest>): Promise<AgentUpdateResponse> {
    const formData = new FormData();
    
    if (data.nom) formData.append('nom', data.nom);
    if (data.prenom) formData.append('prenom', data.prenom);
    if (data.telephone) formData.append('telephone', data.telephone);
    if (data.email) formData.append('email', data.email);
    if (data.date_naissance) formData.append('date_naissance', data.date_naissance);
    if (data.adresse) formData.append('adresse', data.adresse);
    if (data.photo) formData.append('photo', data.photo);
    if (data.tricycle_id !== undefined) {
      formData.append('tricycle_id', data.tricycle_id === null ? '' : data.tricycle_id.toString());
    }
    if (data.statut) formData.append('statut', data.statut);

    return this.client.patch<AgentUpdateResponse>(`/admin/agents/${id}`, formData);
  }

  /**
   * Supprime un agent
   * DELETE /admin/agents/{id}
   */
  async delete(id: number): Promise<AgentDeleteResponse> {
    return this.client.delete<AgentDeleteResponse>(`/admin/agents/${id}`);
  }
}

// Instances singleton exportées
export const tricyclesApi = new TricyclesApi();
export const agentsApi = new AgentsApi();