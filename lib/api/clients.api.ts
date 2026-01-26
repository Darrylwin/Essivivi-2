/**
 * =====================================================
 * API Client - Clients
 * =====================================================
 * Client pour les endpoints de gestion des clients
 * 
 * @module lib/api/clients.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  ClientListResponse,
  Client,
  ClientCreateRequest,
  ClientCreateResponse,
  ClientUpdateRequest,
  ClientUpdateResponse,
  ClientDeleteResponse,
  ClientListParams,
} from "../types";

export class ClientsApi {
  private client = apiClient;

  /**
   * Liste tous les clients
   * GET /admin/clients
   */
  async list(params?: ClientListParams): Promise<ClientListResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params?.type_client) {
      queryParams.type_client = params.type_client;
    }
    if (params?.statut) {
      queryParams.statut = params.statut;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    return this.client.get<ClientListResponse>("/admin/clients", queryParams);
  }

  /**
   * Récupère les détails d'un client
   * GET /admin/clients/{id}
   */
  async get(id: number): Promise<Client> {
    return this.client.get<Client>(`/admin/clients/${id}`);
  }

  /**
   * Crée un nouveau client
   * POST /admin/clients
   * Content-Type: multipart/form-data si photo fournie
   */
  async create(data: ClientCreateRequest): Promise<ClientCreateResponse> {
    const formData = new FormData();
    
    formData.append('nom_point_vente', data.nom_point_vente);
    formData.append('nom_responsable', data.nom_responsable);
    formData.append('telephone', data.telephone);
    formData.append('email', data.email);
    formData.append('adresse', data.adresse);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    formData.append('type_client', data.type_client);
    if (data.photo_point_vente) formData.append('photo_point_vente', data.photo_point_vente);
    formData.append('mot_de_passe', data.mot_de_passe);

    return this.client.post<ClientCreateResponse>("/admin/clients", formData);
  }

  /**
   * Modifie un client (complet)
   * PUT /admin/clients/{id}
   */
  async update(id: number, data: ClientUpdateRequest): Promise<ClientUpdateResponse> {
    const formData = new FormData();
    
    if (data.nom_point_vente) formData.append('nom_point_vente', data.nom_point_vente);
    if (data.nom_responsable) formData.append('nom_responsable', data.nom_responsable);
    if (data.telephone) formData.append('telephone', data.telephone);
    if (data.email) formData.append('email', data.email);
    if (data.adresse) formData.append('adresse', data.adresse);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    if (data.type_client) formData.append('type_client', data.type_client);
    if (data.photo_point_vente) formData.append('photo_point_vente', data.photo_point_vente);
    if (data.statut) formData.append('statut', data.statut);

    return this.client.put<ClientUpdateResponse>(`/admin/clients/${id}`, formData);
  }

  /**
   * Modifie partiellement un client
   * PATCH /admin/clients/{id}
   */
  async patch(id: number, data: Partial<ClientUpdateRequest>): Promise<ClientUpdateResponse> {
    const formData = new FormData();
    
    if (data.nom_point_vente) formData.append('nom_point_vente', data.nom_point_vente);
    if (data.nom_responsable) formData.append('nom_responsable', data.nom_responsable);
    if (data.telephone) formData.append('telephone', data.telephone);
    if (data.email) formData.append('email', data.email);
    if (data.adresse) formData.append('adresse', data.adresse);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    if (data.type_client) formData.append('type_client', data.type_client);
    if (data.photo_point_vente) formData.append('photo_point_vente', data.photo_point_vente);
    if (data.statut) formData.append('statut', data.statut);

    return this.client.patch<ClientUpdateResponse>(`/admin/clients/${id}`, formData);
  }

  /**
   * Supprime un client
   * DELETE /admin/clients/{id}
   */
  async delete(id: number): Promise<ClientDeleteResponse> {
    return this.client.delete<ClientDeleteResponse>(`/admin/clients/${id}`);
  }
}

// Instance singleton exportée
export const clientsApi = new ClientsApi();