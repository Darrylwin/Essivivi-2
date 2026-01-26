/**
 * =====================================================
 * Hook - Clients
 * =====================================================
 * Hook React pour la gestion des clients
 * 
 * @module lib/hooks/useClients
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { clientsApi } from "../api";
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

interface UseClientsReturn {
  clients: ClientListResponse | null;
  client: Client | null;
  loading: boolean;
  error: string | null;

  fetchClients: (params?: ClientListParams) => Promise<void>;
  fetchClient: (id: number) => Promise<void>;
  createClient: (data: ClientCreateRequest) => Promise<ClientCreateResponse>;
  updateClient: (id: number, data: ClientUpdateRequest) => Promise<ClientUpdateResponse>;
  patchClient: (id: number, data: Partial<ClientUpdateRequest>) => Promise<ClientUpdateResponse>;
  deleteClient: (id: number) => Promise<ClientDeleteResponse>;

  clearClient: () => void;
  clearError: () => void;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<ClientListResponse | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (params?: ClientListParams): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientsApi.list(params);
      setClients(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch clients";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClient = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientsApi.get(id);
      setClient(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch client";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (data: ClientCreateRequest): Promise<ClientCreateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientsApi.create(data);
      
      // Update clients list if it exists
      if (clients?.results) {
        setClients(prev => ({
          count: (prev?.count ?? 0) + 1,
          results: [...(prev?.results ?? []), {
            id: response.client.id,
            code_client: response.client.code_client,
            nom_point_vente: response.client.nom_point_vente,
            nom_responsable: response.client.nom_responsable,
            telephone: response.client.telephone,
            email: response.client.email,
            adresse: response.client.adresse,
            type_client: response.client.type_client,
            statut: response.client.statut,
            date_inscription: response.client.date_inscription,
          }]
        }));
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create client";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clients]);

  const updateClient = useCallback(async (id: number, data: ClientUpdateRequest): Promise<ClientUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientsApi.update(id, data);
      
      // Update current client if it's the same
      if (client?.id === id) {
        setClient(response.client);
      }
      
      // Update clients list if it exists
      if (clients?.results) {
        setClients(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom_point_vente && { nom_point_vente: data.nom_point_vente }),
                ...(data.nom_responsable && { nom_responsable: data.nom_responsable }),
                ...(data.telephone && { telephone: data.telephone }),
                ...(data.email && { email: data.email }),
                ...(data.adresse && { adresse: data.adresse }),
                ...(data.type_client && { type_client: data.type_client }),
                ...(data.statut && { statut: data.statut }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update client";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, clients]);

  const patchClient = useCallback(async (id: number, data: Partial<ClientUpdateRequest>): Promise<ClientUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientsApi.patch(id, data);
      
      // Update current client if it's the same
      if (client?.id === id) {
        setClient(response.client);
      }
      
      // Update clients list if it exists
      if (clients?.results) {
        setClients(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom_point_vente && { nom_point_vente: data.nom_point_vente }),
                ...(data.nom_responsable && { nom_responsable: data.nom_responsable }),
                ...(data.telephone && { telephone: data.telephone }),
                ...(data.email && { email: data.email }),
                ...(data.adresse && { adresse: data.adresse }),
                ...(data.type_client && { type_client: data.type_client }),
                ...(data.statut && { statut: data.statut }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to patch client";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, clients]);

  const deleteClient = useCallback(async (id: number): Promise<ClientDeleteResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientsApi.delete(id);
      
      // Remove from clients list if it exists
      if (clients?.results) {
        setClients(prev => ({
          count: (prev?.count ?? 1) - 1,
          results: (prev?.results ?? []).filter(item => item.id !== id)
        }));
      }
      
      // Clear current client if it's the same
      if (client?.id === id) {
        setClient(null);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete client";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, clients]);

  const clearClient = useCallback(() => {
    setClient(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    clients,
    client,
    loading,
    error,

    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    patchClient,
    deleteClient,

    clearClient,
    clearError,
  };
}