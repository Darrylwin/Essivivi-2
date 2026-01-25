/**
 * =====================================================
 * API Client - Gestion des Utilisateurs (Admin)
 * =====================================================
 * Client pour les endpoints de gestion des agents et clients
 * 
 * @module lib.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  // Types de base
  Tricycle,
  AgentList,
  AgentDetail,
  AgentCreateRequest,
  AgentUpdateRequest,
  AgentChangePasswordRequest,
  AgentListResponse,
  AgentDetailResponse,
  ClientList,
  ClientDetail,
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientListResponse,
  ClientDetailResponse,
  SimpleMessageResponse,
  AgentQueryParams,
  ClientQueryParams,
} from "../types";

export class UsersApi {
  private client = apiClient;

  // ========== TRICYCLES ==========
  
  /**
   * Liste tous les tricycles
   * GET /tricycles/
   */
  async getTricycles(): Promise<Tricycle[]> {
    return this.client.get<Tricycle[]>("/tricycles/");
  }

  /**
   * Créer un tricycle
   * POST /tricycles/
   */
  async createTricycle(plaque_immatriculation: string): Promise<Tricycle> {
    return this.client.post<Tricycle>("/tricycles/", {
      plaque_immatriculation,
    });
  }

  /**
   * Détails d'un tricycle
   * GET /tricycles/{id}/
   */
  async getTricycle(id: number): Promise<Tricycle> {
    return this.client.get<Tricycle>(`/tricycles/${id}/`);
  }

  /**
   * Modifier un tricycle
   * PUT /tricycles/{id}/
   */
  async updateTricycle(id: number, plaque_immatriculation: string): Promise<Tricycle> {
    return this.client.put<Tricycle>(`/tricycles/${id}/`, {
      plaque_immatriculation,
    });
  }

  /**
   * Supprimer un tricycle
   * DELETE /tricycles/{id}/
   */
  async deleteTricycle(id: number): Promise<void> {
    await this.client.delete(`/tricycles/${id}/`);
  }

  // ========== AGENTS ==========
  
  /**
   * Liste tous les agents avec filtres
   * GET /admin/agents
   */
  async getAgents(params?: AgentQueryParams): Promise<AgentListResponse> {
    return this.client.get<AgentListResponse>("/admin/agents", params);
  }

  /**
   * Créer un agent
   * POST /admin/agents
   */
  async createAgent(data: AgentCreateRequest): Promise<AgentDetailResponse> {
    // Pour les uploads avec fichiers, utiliser FormData
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append("nom", data.nom);
    formData.append("prenom", data.prenom);
    formData.append("telephone", data.telephone);
    formData.append("email", data.email);
    formData.append("date_naissance", data.date_naissance);
    formData.append("adresse", data.adresse);
    
    if (data.tricycle_id !== undefined) {
      formData.append("tricycle_id", data.tricycle_id?.toString() || "");
    }
    
    if (data.mot_de_passe) {
      formData.append("mot_de_passe", data.mot_de_passe);
    }
    
    // Ajouter le fichier photo si présent
    if (data.photo) {
      formData.append("photo", data.photo);
    }
    
    return this.client.post<AgentDetailResponse>(
      "/admin/agents",
      formData,
      {
        // Content-Type sera automatiquement défini par fetch pour FormData
        "Accept": "application/json",
      }
    );
  }

  /**
   * Détails d'un agent
   * GET /admin/agents/{id}
   */
  async getAgent(id: number): Promise<AgentDetail> {
    return this.client.get<AgentDetail>(`/admin/agents/${id}`);
  }

  /**
   * Modifier un agent (PUT - modification complète)
   * PUT /admin/agents/{id}
   */
  async updateAgent(id: number, data: AgentUpdateRequest): Promise<AgentDetailResponse> {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.nom) formData.append("nom", data.nom);
    if (data.prenom) formData.append("prenom", data.prenom);
    if (data.telephone) formData.append("telephone", data.telephone);
    if (data.email) formData.append("email", data.email);
    if (data.date_naissance) formData.append("date_naissance", data.date_naissance);
    if (data.adresse) formData.append("adresse", data.adresse);
    if (data.statut) formData.append("statut", data.statut);
    
    if (data.tricycle_id !== undefined) {
      formData.append("tricycle_id", data.tricycle_id?.toString() || "");
    }
    
    if (data.photo !== undefined) {
      if (data.photo) {
        formData.append("photo", data.photo);
      } else {
        // Pour supprimer la photo, envoyer une chaîne vide
        formData.append("photo", "");
      }
    }
    
    return this.client.put<AgentDetailResponse>(
      `/admin/agents/${id}`,
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Modifier partiellement un agent (PATCH)
   * PATCH /admin/agents/{id}
   */
  async patchAgent(id: number, data: AgentUpdateRequest): Promise<AgentDetailResponse> {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.nom) formData.append("nom", data.nom);
    if (data.prenom) formData.append("prenom", data.prenom);
    if (data.telephone) formData.append("telephone", data.telephone);
    if (data.email) formData.append("email", data.email);
    if (data.date_naissance) formData.append("date_naissance", data.date_naissance);
    if (data.adresse) formData.append("adresse", data.adresse);
    if (data.statut) formData.append("statut", data.statut);
    
    if (data.tricycle_id !== undefined) {
      formData.append("tricycle_id", data.tricycle_id?.toString() || "");
    }
    
    if (data.photo !== undefined) {
      if (data.photo) {
        formData.append("photo", data.photo);
      } else {
        // Pour supprimer la photo
        formData.append("photo", "");
      }
    }
    
    return this.client.patch<AgentDetailResponse>(
      `/admin/agents/${id}`,
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Supprimer un agent
   * DELETE /admin/agents/{id}
   */
  async deleteAgent(id: number): Promise<SimpleMessageResponse> {
    return this.client.delete<SimpleMessageResponse>(`/admin/agents/${id}`);
  }

  /**
   * Changer le mot de passe d'un agent
   * POST /admin/agents/{id}/change-password
   */
  async changeAgentPassword(id: number, data: AgentChangePasswordRequest): Promise<SimpleMessageResponse> {
    return this.client.post<SimpleMessageResponse>(
      `/admin/agents/${id}/change-password`,
      data
    );
  }

  // ========== CLIENTS ==========
  
  /**
   * Liste tous les clients avec filtres
   * GET /admin/clients
   */
  async getClients(params?: ClientQueryParams): Promise<ClientListResponse> {
    return this.client.get<ClientListResponse>("/admin/clients", params);
  }

  /**
   * Créer un client
   * POST /admin/clients
   */
  async createClient(data: ClientCreateRequest): Promise<ClientDetailResponse> {
    const formData = new FormData();
    
    // Champs obligatoires
    formData.append("nom_point_vente", data.nom_point_vente);
    formData.append("nom_responsable", data.nom_responsable);
    formData.append("telephone", data.telephone);
    formData.append("email", data.email);
    formData.append("adresse", data.adresse);
    formData.append("type_client", data.type_client);
    formData.append("mot_de_passe", data.mot_de_passe);
    
    // Champs optionnels
    if (data.latitude !== undefined) {
      formData.append("latitude", data.latitude?.toString() || "");
    }
    
    if (data.longitude !== undefined) {
      formData.append("longitude", data.longitude?.toString() || "");
    }
    
    if (data.photo_point_vente) {
      formData.append("photo_point_vente", data.photo_point_vente);
    }
    
    return this.client.post<ClientDetailResponse>(
      "/admin/clients",
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Détails d'un client
   * GET /admin/clients/{id}
   */
  async getClient(id: number): Promise<ClientDetail> {
    return this.client.get<ClientDetail>(`/admin/clients/${id}`);
  }

  /**
   * Modifier un client (PUT - modification complète)
   * PUT /admin/clients/{id}
   */
  async updateClient(id: number, data: ClientUpdateRequest): Promise<ClientDetailResponse> {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.nom_point_vente) formData.append("nom_point_vente", data.nom_point_vente);
    if (data.nom_responsable) formData.append("nom_responsable", data.nom_responsable);
    if (data.telephone) formData.append("telephone", data.telephone);
    if (data.email) formData.append("email", data.email);
    if (data.adresse) formData.append("adresse", data.adresse);
    if (data.type_client) formData.append("type_client", data.type_client);
    if (data.statut) formData.append("statut", data.statut);
    
    if (data.latitude !== undefined) {
      formData.append("latitude", data.latitude?.toString() || "");
    }
    
    if (data.longitude !== undefined) {
      formData.append("longitude", data.longitude?.toString() || "");
    }
    
    if (data.photo_point_vente !== undefined) {
      if (data.photo_point_vente) {
        formData.append("photo_point_vente", data.photo_point_vente);
      } else {
        // Pour supprimer la photo
        formData.append("photo_point_vente", "");
      }
    }
    
    return this.client.put<ClientDetailResponse>(
      `/admin/clients/${id}`,
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Modifier partiellement un client (PATCH)
   * PATCH /admin/clients/{id}
   */
  async patchClient(id: number, data: ClientUpdateRequest): Promise<ClientDetailResponse> {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.nom_point_vente) formData.append("nom_point_vente", data.nom_point_vente);
    if (data.nom_responsable) formData.append("nom_responsable", data.nom_responsable);
    if (data.telephone) formData.append("telephone", data.telephone);
    if (data.email) formData.append("email", data.email);
    if (data.adresse) formData.append("adresse", data.adresse);
    if (data.type_client) formData.append("type_client", data.type_client);
    if (data.statut) formData.append("statut", data.statut);
    
    if (data.latitude !== undefined) {
      formData.append("latitude", data.latitude?.toString() || "");
    }
    
    if (data.longitude !== undefined) {
      formData.append("longitude", data.longitude?.toString() || "");
    }
    
    if (data.photo_point_vente !== undefined) {
      if (data.photo_point_vente) {
        formData.append("photo_point_vente", data.photo_point_vente);
      } else {
        // Pour supprimer la photo
        formData.append("photo_point_vente", "");
      }
    }
    
    return this.client.patch<ClientDetailResponse>(
      `/admin/clients/${id}`,
      formData,
      {
        "Accept": "application/json",
      }
    );
  }

  /**
   * Supprimer un client
   * DELETE /admin/clients/{id}
   */
  async deleteClient(id: number): Promise<SimpleMessageResponse> {
    return this.client.delete<SimpleMessageResponse>(`/admin/clients/${id}`);
  }
}

// Instance singleton exportée
export const usersApi = new UsersApi();