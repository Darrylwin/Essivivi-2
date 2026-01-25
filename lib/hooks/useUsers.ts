/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * =====================================================
 * Hook - Gestion des Utilisateurs
 * =====================================================
 * Hook React pour la gestion des agents et clients (Admin)
 * 
 * @module lib/hooks/useUsers
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { usersApi } from "../api";
import type {
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

interface UseUsersState {
  // Agents
  agents: AgentList[];
  agentsCount: number;
  agentsLoading: boolean;
  agentsError: string | null;
  
  // Clients
  clients: ClientList[];
  clientsCount: number;
  clientsLoading: boolean;
  clientsError: string | null;
  
  // Tricycles
  tricycles: Tricycle[];
  tricyclesLoading: boolean;
  tricyclesError: string | null;
  
  // Détails
  currentAgent: AgentDetail | null;
  currentClient: ClientDetail | null;
  detailLoading: boolean;
  detailError: string | null;
}

export function useUsers() {
  const [state, setState] = useState<UseUsersState>({
    // Agents
    agents: [],
    agentsCount: 0,
    agentsLoading: false,
    agentsError: null,
    
    // Clients
    clients: [],
    clientsCount: 0,
    clientsLoading: false,
    clientsError: null,
    
    // Tricycles
    tricycles: [],
    tricyclesLoading: false,
    tricyclesError: null,
    
    // Détails
    currentAgent: null,
    currentClient: null,
    detailLoading: false,
    detailError: null,
  });

  // ========== TRICYCLES ==========
  
  const fetchTricycles = useCallback(async () => {
    setState(prev => ({ ...prev, tricyclesLoading: true, tricyclesError: null }));
    
    try {
      const tricycles = await usersApi.getTricycles();
      setState(prev => ({
        ...prev,
        tricycles: Array.isArray(tricycles) ? tricycles : [], // Ajout de cette vérification
        tricyclesLoading: false,
      }));
      
      return tricycles;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        tricyclesError: error.message || "Erreur lors du chargement des tricycles",
        tricyclesLoading: false,
      }));
      throw error;
    }
  }, []);

  const createTricycle = useCallback(async (plaque_immatriculation: string) => {
    try {
      const tricycle = await usersApi.createTricycle(plaque_immatriculation);
      
      // Ajouter à la liste
      setState(prev => ({
        ...prev,
        tricycles: [tricycle, ...prev.tricycles],
      }));
      
      return tricycle;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const deleteTricycle = useCallback(async (id: number) => {
    try {
      await usersApi.deleteTricycle(id);
      
      // Retirer de la liste
      setState(prev => ({
        ...prev,
        tricycles: prev.tricycles.filter(t => t.id !== id),
      }));
      
      return true;
    } catch (error: any) {
      throw error;
    }
  }, []);

  // ========== AGENTS ==========
  
  const fetchAgents = useCallback(async (params?: AgentQueryParams) => {
    setState(prev => ({ ...prev, agentsLoading: true, agentsError: null }));
    
    try {
      const response = await usersApi.getAgents(params);
      setState(prev => ({
        ...prev,
        agents: response.results,
        agentsCount: response.count,
        agentsLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        agentsError: error.message || "Erreur lors du chargement des agents",
        agentsLoading: false,
      }));
      throw error;
    }
  }, []);

  const fetchAgent = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const agent = await usersApi.getAgent(id);
      setState(prev => ({
        ...prev,
        currentAgent: agent,
        detailLoading: false,
      }));
      
      return agent;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors du chargement de l'agent",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const createAgent = useCallback(async (data: AgentCreateRequest): Promise<AgentDetailResponse> => {
    setState(prev => ({ ...prev, agentsLoading: true, agentsError: null }));
    
    try {
      const response = await usersApi.createAgent(data);
      
      // Ajouter à la liste (si disponible)
      if (response.agent) {
        const agentList: AgentList = {
          id: response.agent.id,
          numero_identification: response.agent.numero_identification,
          nom: response.agent.nom,
          prenom: response.agent.prenom,
          telephone: response.agent.telephone,
          email: response.agent.email,
          statut: response.agent.statut,
          created_at: response.agent.created_at,
          tricycle_plaque: response.agent.tricycle?.plaque_immatriculation,
        };
        
        setState(prev => ({
          ...prev,
          agents: [agentList, ...prev.agents],
          agentsCount: prev.agentsCount + 1,
          agentsLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, agentsLoading: false }));
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        agentsError: error.message || "Erreur lors de la création de l'agent",
        agentsLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateAgent = useCallback(async (id: number, data: AgentUpdateRequest): Promise<AgentDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await usersApi.updateAgent(id, data);
      
      // Mettre à jour dans la liste
      if (response.agent) {
        const updatedAgentList: AgentList = {
          id: response.agent.id,
          numero_identification: response.agent.numero_identification,
          nom: response.agent.nom,
          prenom: response.agent.prenom,
          telephone: response.agent.telephone,
          email: response.agent.email,
          statut: response.agent.statut,
          created_at: response.agent.created_at,
          tricycle_plaque: response.agent.tricycle?.plaque_immatriculation,
        };
        
        setState(prev => ({
          ...prev,
          agents: prev.agents.map(agent => 
            agent.id === id ? updatedAgentList : agent
          ),
          currentAgent: response.agent,
          detailLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, detailLoading: false }));
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour de l'agent",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const patchAgent = useCallback(async (id: number, data: AgentUpdateRequest): Promise<AgentDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await usersApi.patchAgent(id, data);
      
      // Mettre à jour dans la liste
      if (response.agent) {
        const updatedAgentList: AgentList = {
          id: response.agent.id,
          numero_identification: response.agent.numero_identification,
          nom: response.agent.nom,
          prenom: response.agent.prenom,
          telephone: response.agent.telephone,
          email: response.agent.email,
          statut: response.agent.statut,
          created_at: response.agent.created_at,
          tricycle_plaque: response.agent.tricycle?.plaque_immatriculation,
        };
        
        setState(prev => ({
          ...prev,
          agents: prev.agents.map(agent => 
            agent.id === id ? updatedAgentList : agent
          ),
          currentAgent: response.agent,
          detailLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, detailLoading: false }));
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour de l'agent",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const deleteAgent = useCallback(async (id: number): Promise<SimpleMessageResponse> => {
    try {
      const response = await usersApi.deleteAgent(id);
      
      // Retirer de la liste
      setState(prev => ({
        ...prev,
        agents: prev.agents.filter(agent => agent.id !== id),
        agentsCount: prev.agentsCount - 1,
        currentAgent: prev.currentAgent?.id === id ? null : prev.currentAgent,
      }));
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const changeAgentPassword = useCallback(async (id: number, data: AgentChangePasswordRequest): Promise<SimpleMessageResponse> => {
    return usersApi.changeAgentPassword(id, data);
  }, []);

  // ========== CLIENTS ==========
  
  const fetchClients = useCallback(async (params?: ClientQueryParams) => {
    setState(prev => ({ ...prev, clientsLoading: true, clientsError: null }));
    
    try {
      const response = await usersApi.getClients(params);
      setState(prev => ({
        ...prev,
        clients: response.results,
        clientsCount: response.count,
        clientsLoading: false,
      }));
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        clientsError: error.message || "Erreur lors du chargement des clients",
        clientsLoading: false,
      }));
      throw error;
    }
  }, []);

  const fetchClient = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const client = await usersApi.getClient(id);
      setState(prev => ({
        ...prev,
        currentClient: client,
        detailLoading: false,
      }));
      
      return client;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors du chargement du client",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const createClient = useCallback(async (data: ClientCreateRequest): Promise<ClientDetailResponse> => {
    setState(prev => ({ ...prev, clientsLoading: true, clientsError: null }));
    
    try {
      const response = await usersApi.createClient(data);
      
      // Ajouter à la liste (si disponible)
      if (response.client) {
        const clientList: ClientList = {
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
          created_at: response.client.created_at,
        };
        
        setState(prev => ({
          ...prev,
          clients: [clientList, ...prev.clients],
          clientsCount: prev.clientsCount + 1,
          clientsLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, clientsLoading: false }));
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        clientsError: error.message || "Erreur lors de la création du client",
        clientsLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateClient = useCallback(async (id: number, data: ClientUpdateRequest): Promise<ClientDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await usersApi.updateClient(id, data);
      
      // Mettre à jour dans la liste
      if (response.client) {
        const updatedClientList: ClientList = {
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
          created_at: response.client.created_at,
        };
        
        setState(prev => ({
          ...prev,
          clients: prev.clients.map(client => 
            client.id === id ? updatedClientList : client
          ),
          currentClient: response.client,
          detailLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, detailLoading: false }));
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour du client",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const patchClient = useCallback(async (id: number, data: ClientUpdateRequest): Promise<ClientDetailResponse> => {
    setState(prev => ({ ...prev, detailLoading: true, detailError: null }));
    
    try {
      const response = await usersApi.patchClient(id, data);
      
      // Mettre à jour dans la liste
      if (response.client) {
        const updatedClientList: ClientList = {
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
          created_at: response.client.created_at,
        };
        
        setState(prev => ({
          ...prev,
          clients: prev.clients.map(client => 
            client.id === id ? updatedClientList : client
          ),
          currentClient: response.client,
          detailLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, detailLoading: false }));
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        detailError: error.message || "Erreur lors de la mise à jour du client",
        detailLoading: false,
      }));
      throw error;
    }
  }, []);

  const deleteClient = useCallback(async (id: number): Promise<SimpleMessageResponse> => {
    try {
      const response = await usersApi.deleteClient(id);
      
      // Retirer de la liste
      setState(prev => ({
        ...prev,
        clients: prev.clients.filter(client => client.id !== id),
        clientsCount: prev.clientsCount - 1,
        currentClient: prev.currentClient?.id === id ? null : prev.currentClient,
      }));
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }, []);

  // ========== UTILITIES ==========
  
  const clearCurrentAgent = useCallback(() => {
    setState(prev => ({ ...prev, currentAgent: null }));
  }, []);

  const clearCurrentClient = useCallback(() => {
    setState(prev => ({ ...prev, currentClient: null }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      agentsError: null,
      clientsError: null,
      tricyclesError: null,
      detailError: null,
    }));
  }, []);

  return {
    // State
    ...state,
    
    // Tricycles
    fetchTricycles,
    createTricycle,
    deleteTricycle,
    
    // Agents
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    patchAgent,
    deleteAgent,
    changeAgentPassword,
    
    // Clients
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    patchClient,
    deleteClient,
    
    // Utilities
    clearCurrentAgent,
    clearCurrentClient,
    clearErrors,
  };
}