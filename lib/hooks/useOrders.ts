/**
 * =====================================================
 * Hook - Commandes
 * =====================================================
 * Hook React pour la gestion des commandes
 * 
 * @module lib/hooks/useOrders
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { ordersApi } from "../api";
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

interface UseOrdersReturn {
  commandes: CommandeListResponse | null;
  commande: Commande | null;
  availableAgents: AgentsDisponiblesResponse | null;
  loading: boolean;
  error: string | null;

  fetchCommandes: (params?: CommandeListParams) => Promise<void>;
  fetchCommande: (id: number) => Promise<void>;
  assignCommande: (id: number, data: CommandeAssignRequest) => Promise<CommandeAssignResponse>;
  updateStatus: (id: number, data: CommandeStatusRequest) => Promise<CommandeStatusResponse>;
  deleteCommande: (id: number) => Promise<{ message: string }>;
  fetchAvailableAgents: () => Promise<void>;

  clearCommande: () => void;
  clearError: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [commandes, setCommandes] = useState<CommandeListResponse | null>(null);
  const [commande, setCommande] = useState<Commande | null>(null);
  const [availableAgents, setAvailableAgents] = useState<AgentsDisponiblesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommandes = useCallback(async (params?: CommandeListParams): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.list(params);
      setCommandes(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommande = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.get(id);
      setCommande(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch order";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignCommande = useCallback(async (id: number, data: CommandeAssignRequest): Promise<CommandeAssignResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.assign(id, data);
      
      // Update current order if it's the same
      if (commande?.id === id) {
        setCommande(response.commande);
      }
      
      // Update orders list if it exists
      if (commandes?.results) {
        setCommandes(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                agent: data.agent_id,
                agent_numero: response.commande.agent_numero,
                agent_nom: response.commande.agent_nom_complet,
                est_assignee: true,
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign order";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [commande, commandes]);

  const updateStatus = useCallback(async (id: number, data: CommandeStatusRequest): Promise<CommandeStatusResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.updateStatus(id, data);
      
      // Update current order if it's the same
      if (commande?.id === id) {
        setCommande(response.commande);
      }
      
      // Update orders list if it exists
      if (commandes?.results) {
        setCommandes(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                statut: data.statut,
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update order status";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [commande, commandes]);

  const deleteCommande = useCallback(async (id: number): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.delete(id);
      
      // Remove from orders list if it exists
      if (commandes?.results) {
        setCommandes(prev => ({
          count: (prev?.count ?? 1) - 1,
          results: (prev?.results ?? []).filter(item => item.id !== id)
        }));
      }
      
      // Clear current order if it's the same
      if (commande?.id === id) {
        setCommande(null);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete order";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [commande, commandes]);

  const fetchAvailableAgents = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.getAvailableAgents();
      setAvailableAgents(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch available agents";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCommande = useCallback(() => {
    setCommande(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    commandes,
    commande,
    availableAgents,
    loading,
    error,

    fetchCommandes,
    fetchCommande,
    assignCommande,
    updateStatus,
    deleteCommande,
    fetchAvailableAgents,

    clearCommande,
    clearError,
  };
}