/**
 * =====================================================
 * Hook - Agents & Tricycles
 * =====================================================
 * Hook React pour la gestion des agents et tricycles
 * 
 * @module lib/hooks/useAgents
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { agentsApi, tricyclesApi } from "../api";
import type {
  AgentListResponse,
  Agent,
  AgentCreateRequest,
  AgentCreateResponse,
  AgentUpdateRequest,
  AgentUpdateResponse,
  AgentDeleteResponse,
  AgentListParams,
  Tricycle,
  TricycleCreateRequest,
  TricycleUpdateRequest,
} from "../types";

interface UseAgentsReturn {
  // Agents
  agents: AgentListResponse | null;
  agent: Agent | null;
  loading: boolean;
  error: string | null;
  
  // Tricycles
  tricycles: Tricycle[] | null;
  tricycle: Tricycle | null;
  tricyclesLoading: boolean;
  tricyclesError: string | null;

  // Agent Methods
  fetchAgents: (params?: AgentListParams) => Promise<void>;
  fetchAgent: (id: number) => Promise<void>;
  createAgent: (data: AgentCreateRequest) => Promise<AgentCreateResponse>;
  updateAgent: (id: number, data: AgentUpdateRequest) => Promise<AgentUpdateResponse>;
  patchAgent: (id: number, data: Partial<AgentUpdateRequest>) => Promise<AgentUpdateResponse>;
  deleteAgent: (id: number) => Promise<AgentDeleteResponse>;

  // Tricycle Methods
  fetchTricycles: () => Promise<void>;
  fetchTricycle: (id: number) => Promise<void>;
  createTricycle: (data: TricycleCreateRequest) => Promise<Tricycle>;
  updateTricycle: (id: number, data: TricycleUpdateRequest) => Promise<Tricycle>;
  deleteTricycle: (id: number) => Promise<void>;

  // Utilities
  clearAgent: () => void;
  clearError: () => void;
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<AgentListResponse | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [tricycles, setTricycles] = useState<Tricycle[] | null>(null);
  const [tricycle, setTricycle] = useState<Tricycle | null>(null);
  const [tricyclesLoading, setTricyclesLoading] = useState<boolean>(false);
  const [tricyclesError, setTricyclesError] = useState<string | null>(null);

  const fetchAgents = useCallback(async (params?: AgentListParams): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agentsApi.list(params);
      setAgents(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch agents";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAgent = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agentsApi.get(id);
      setAgent(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch agent";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (data: AgentCreateRequest): Promise<AgentCreateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agentsApi.create(data);
      
      // Update agents list if it exists
      if (agents?.results) {
        setAgents(prev => ({
          count: (prev?.count ?? 0) + 1,
          results: [...(prev?.results ?? []), {
            id: response.agent.id,
            numero_identification: response.agent.numero_identification,
            nom: response.agent.nom,
            prenom: response.agent.prenom,
            telephone: response.agent.telephone,
            email: response.agent.email,
            tricycle_plaque: response.agent.tricycle?.plaque_immatriculation ?? null,
            statut: response.agent.statut,
            created_at: response.agent.created_at,
          }]
        }));
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create agent";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agents]);

  const updateAgent = useCallback(async (id: number, data: AgentUpdateRequest): Promise<AgentUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agentsApi.update(id, data);
      
      // Update current agent if it's the same
      if (agent?.id === id) {
        setAgent(response.agent);
      }
      
      // Update agents list if it exists
      if (agents?.results) {
        setAgents(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom && { nom: data.nom }),
                ...(data.prenom && { prenom: data.prenom }),
                ...(data.telephone && { telephone: data.telephone }),
                ...(data.email && { email: data.email }),
                ...(data.statut && { statut: data.statut }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update agent";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agent, agents]);

  const patchAgent = useCallback(async (id: number, data: Partial<AgentUpdateRequest>): Promise<AgentUpdateResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agentsApi.patch(id, data);
      
      // Update current agent if it's the same
      if (agent?.id === id) {
        setAgent(response.agent);
      }
      
      // Update agents list if it exists
      if (agents?.results) {
        setAgents(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            results: prev.results.map(item => 
              item.id === id ? {
                ...item,
                ...(data.nom && { nom: data.nom }),
                ...(data.prenom && { prenom: data.prenom }),
                ...(data.telephone && { telephone: data.telephone }),
                ...(data.email && { email: data.email }),
                ...(data.statut && { statut: data.statut }),
              } : item
            )
          };
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to patch agent";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agent, agents]);

  const deleteAgent = useCallback(async (id: number): Promise<AgentDeleteResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agentsApi.delete(id);
      
      // Remove from agents list if it exists
      if (agents?.results) {
        setAgents(prev => ({
          count: (prev?.count ?? 1) - 1,
          results: (prev?.results ?? []).filter(item => item.id !== id)
        }));
      }
      
      // Clear current agent if it's the same
      if (agent?.id === id) {
        setAgent(null);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete agent";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agent, agents]);

  const fetchTricycles = useCallback(async (): Promise<void> => {
    setTricyclesLoading(true);
    setTricyclesError(null);
    
    try {
      const response = await tricyclesApi.list();
      
      // Debug log
      console.log('Tricycles API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array?', Array.isArray(response));
      
      // Handle different response formats
      let tricyclesArray: Tricycle[] = [];
      
      if (Array.isArray(response)) {
        // Format 1: Direct array
        tricyclesArray = response;
      } else if (response && typeof response === 'object') {
        // Format 2: Object with pagination
        if ('results' in response && Array.isArray(response.results)) {
          tricyclesArray = response.results;
        } else if ('data' in response && Array.isArray(response.data)) {
          // Format 3: Object with data
          tricyclesArray = response.data;
        } else {
          // Try to extract array from object
          const values = Object.values(response);
          const arrayFromObject = values.find(v => Array.isArray(v));
          if (Array.isArray(arrayFromObject)) {
            tricyclesArray = arrayFromObject;
          }
        }
      }
      
      console.log('Extracted tricycles array:', tricyclesArray);
      setTricycles(tricyclesArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tricycles";
      setTricyclesError(errorMessage);
      throw err;
    } finally {
      setTricyclesLoading(false);
    }
  }, []);

  const fetchTricycle = useCallback(async (id: number): Promise<void> => {
    setTricyclesLoading(true);
    setTricyclesError(null);
    
    try {
      const response = await tricyclesApi.get(id);
      setTricycle(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tricycle";
      setTricyclesError(errorMessage);
      throw err;
    } finally {
      setTricyclesLoading(false);
    }
  }, []);

  const createTricycle = useCallback(async (data: TricycleCreateRequest): Promise<Tricycle> => {
    setTricyclesLoading(true);
    setTricyclesError(null);
    
    try {
      const response = await tricyclesApi.create(data);
      
      // Update tricycles list if it exists
      if (tricycles) {
        setTricycles(prev => [...(prev ?? []), response]);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create tricycle";
      setTricyclesError(errorMessage);
      throw err;
    } finally {
      setTricyclesLoading(false);
    }
  }, [tricycles]);

  const updateTricycle = useCallback(async (id: number, data: TricycleUpdateRequest): Promise<Tricycle> => {
    setTricyclesLoading(true);
    setTricyclesError(null);
    
    try {
      const response = await tricyclesApi.update(id, data);
      
      // Update current tricycle if it's the same
      if (tricycle?.id === id) {
        setTricycle(response);
      }
      
      // Update tricycles list if it exists
      if (tricycles) {
        setTricycles(prev => 
          (prev ?? []).map(item => 
            item.id === id ? response : item
          )
        );
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update tricycle";
      setTricyclesError(errorMessage);
      throw err;
    } finally {
      setTricyclesLoading(false);
    }
  }, [tricycle, tricycles]);

  const deleteTricycle = useCallback(async (id: number): Promise<void> => {
    setTricyclesLoading(true);
    setTricyclesError(null);
    
    try {
      await tricyclesApi.delete(id);
      
      // Remove from tricycles list if it exists
      if (tricycles) {
        setTricycles(prev => (prev ?? []).filter(item => item.id !== id));
      }
      
      // Clear current tricycle if it's the same
      if (tricycle?.id === id) {
        setTricycle(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete tricycle";
      setTricyclesError(errorMessage);
      throw err;
    } finally {
      setTricyclesLoading(false);
    }
  }, [tricycle, tricycles]);

  const clearAgent = useCallback(() => {
    setAgent(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setTricyclesError(null);
  }, []);

  return {
    // Agents
    agents,
    agent,
    loading,
    error,
    
    // Tricycles
    tricycles,
    tricycle,
    tricyclesLoading,
    tricyclesError,

    // Agent Methods
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    patchAgent,
    deleteAgent,

    // Tricycle Methods
    fetchTricycles,
    fetchTricycle,
    createTricycle,
    updateTricycle,
    deleteTricycle,

    // Utilities
    clearAgent,
    clearError,
  };
}