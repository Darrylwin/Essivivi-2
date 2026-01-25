// useOrders.ts
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * =====================================================
 * Hook - Commandes (Orders)
 * =====================================================
 * Hook React pour la gestion des commandes (admin web)
 * 
 * @module lib/hooks/useOrders
 * @version 1.0
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { ordersApi } from "../api";
import type {
  Commande,
  CommandeListRequest,
  CommandeListResponse,
  CommandeDetailResponse,
  CommandeAssignRequest,
  CommandeStatusRequest,
  CommandeUpdateRequest,
  CommandeStatut,
  Notification,
  NotificationListResponse,
} from "../types";

interface UseOrdersState {
  commandes: Commande[];
  selectedCommande: CommandeDetailResponse | null;
  notifications: Notification[];
  isLoading: boolean;
  isCommandeLoading: boolean;
  isNotificationsLoading: boolean;
  error: string | null;
  pagination: {
    count: number;
    hasMore: boolean;
  };
}

export function useOrders() {
  const [state, setState] = useState<UseOrdersState>({
    commandes: [],
    selectedCommande: null,
    notifications: [],
    isLoading: false,
    isCommandeLoading: false,
    isNotificationsLoading: false,
    error: null,
    pagination: {
      count: 0,
      hasMore: false,
    },
  });

  /**
   * Réinitialiser les erreurs
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Définir une erreur
   */
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // ==================== COMMANDES ====================

  /**
   * Charger la liste des commandes
   */
  const loadCommandes = useCallback(async (filters?: CommandeListRequest, reset = false) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      error: null,
    }));

    try {
      const response = await ordersApi.listCommandes(filters);
      
      setState(prev => ({
        ...prev,
        commandes: reset ? response.results : [...prev.commandes, ...response.results],
        pagination: {
          count: response.count,
          hasMore: response.results.length > 0,
        },
        isLoading: false,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement des commandes";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Charger une commande spécifique
   */
  const loadCommande = useCallback(async (id: number) => {
    setState(prev => ({ 
      ...prev, 
      isCommandeLoading: true,
      error: null,
    }));

    try {
      const commande = await ordersApi.getCommande(id);
      
      setState(prev => ({
        ...prev,
        selectedCommande: commande,
        isCommandeLoading: false,
      }));

      return commande;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement de la commande";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isCommandeLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Créer une commande (pour admin si nécessaire)
   * Note: Normalement les commandes sont créées par les clients via mobile
   */
  const createCommande = useCallback(async () => {
    // Implémentation si nécessaire pour l'admin
    throw new Error("Les commandes sont créées par les clients via l'application mobile");
  }, []);

  /**
   * Mettre à jour une commande
   */
  const updateCommande = useCallback(async (id: number, data: CommandeUpdateRequest) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      const response = await ordersApi.updateCommande(id, data);
      
      // Mettre à jour dans la liste si présente
      setState(prev => ({
        ...prev,
        commandes: prev.commandes.map(cmd => 
          cmd.id === id ? { ...cmd, ...(response.commande as Commande) } : cmd
        ),
        selectedCommande: prev.selectedCommande?.id === id 
          ? ({ ...prev.selectedCommande, ...(response.commande as Partial<CommandeDetailResponse>) } as CommandeDetailResponse) 
          : prev.selectedCommande,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Supprimer une commande
   */
  const deleteCommande = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await ordersApi.deleteCommande(id);
      
      // Retirer de la liste
      setState(prev => ({
        ...prev,
        commandes: prev.commandes.filter(cmd => cmd.id !== id),
        selectedCommande: prev.selectedCommande?.id === id 
          ? null 
          : prev.selectedCommande,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Assigner une commande à un agent
   */
  const assignCommande = useCallback(async (id: number, agentId: number) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      const response = await ordersApi.assignCommande(id, { agent_id: agentId });
      
      // Mettre à jour dans la liste
      setState(prev => ({
        ...prev,
        commandes: prev.commandes.map(cmd => 
          cmd.id === id ? { ...cmd, ...(response.commande as Commande) } : cmd
        ),
        selectedCommande: prev.selectedCommande?.id === id 
          ? ({ ...prev.selectedCommande, ...(response.commande as Partial<CommandeDetailResponse>) } as CommandeDetailResponse) 
          : prev.selectedCommande,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'assignation";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Changer le statut d'une commande
   */
  const changeCommandeStatus = useCallback(async (id: number, statut: CommandeStatut) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      const response = await ordersApi.changeCommandeStatus(id, { statut });
      
      // Mettre à jour dans la liste
      setState(prev => ({
        ...prev,
        commandes: prev.commandes.map(cmd => 
          cmd.id === id ? ({ ...cmd, ...response.commande } as Commande) : cmd
        ),
        selectedCommande: prev.selectedCommande?.id === id 
          ? (response.commande as CommandeDetailResponse) 
          : prev.selectedCommande,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du changement de statut";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Filtrer les commandes par statut
   */
  const filterByStatut = useCallback((statut: CommandeStatut) => {
    return state.commandes.filter(cmd => cmd.statut === statut);
  }, [state.commandes]);

  // ==================== NOTIFICATIONS ====================

  /**
   * Charger les notifications
   */
  const loadNotifications = useCallback(async (filters?: { lue?: boolean }) => {
    setState(prev => ({ 
      ...prev, 
      isNotificationsLoading: true,
      error: null,
    }));

    try {
      const response = await ordersApi.listNotifications(filters);
      
      setState(prev => ({
        ...prev,
        notifications: response.results,
        isNotificationsLoading: false,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement des notifications";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isNotificationsLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Marquer une notification comme lue
   */
  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      const response = await ordersApi.markNotificationAsRead(id);
      
      // Mettre à jour dans la liste
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => 
          notif.id === id ? { ...notif, ...response.notification } : notif
        ),
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du marquage comme lu";
      throw error;
    }
  }, []);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllNotificationsAsRead = useCallback(async () => {
    const unreadNotifications = state.notifications.filter(n => !n.lue);
    
    await Promise.all(
      unreadNotifications.map(notif => markNotificationAsRead(notif.id))
    );
  }, [state.notifications, markNotificationAsRead]);

  /**
   * Récupérer les notifications non lues
   */
  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.lue);
  }, [state.notifications]);

  /**
   * Rafraîchir les notifications périodiquement
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.isNotificationsLoading) {
        loadNotifications();
      }
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [loadNotifications, state.isNotificationsLoading]);

  return {
    // State
    commandes: state.commandes,
    selectedCommande: state.selectedCommande,
    notifications: state.notifications,
    isLoading: state.isLoading,
    isCommandeLoading: state.isCommandeLoading,
    isNotificationsLoading: state.isNotificationsLoading,
    error: state.error,
    pagination: state.pagination,
    unreadNotificationsCount: getUnreadNotifications().length,

    // Actions - Commandes
    loadCommandes,
    loadCommande,
    createCommande,
    updateCommande,
    deleteCommande,
    assignCommande,
    changeCommandeStatus,
    filterByStatut,
    
    // Actions - Notifications
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotifications,
    
    // Utilitaires
    clearError,
    setError,
  };
}