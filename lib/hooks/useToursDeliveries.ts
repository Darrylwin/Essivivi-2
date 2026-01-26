/**
 * =====================================================
 * Hook - Tournées & Livraisons
 * =====================================================
 * Hook React pour la gestion des tournées et livraisons
 * 
 * @module lib/hooks/useToursDeliveries
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { toursApi, deliveriesApi } from "../api";
import type {
  TourneeListResponse,
  Tournee,
  TourneeListParams,
  LivraisonListResponse,
  Livraison,
  LivraisonListParams,
} from "../types";

interface UseToursDeliveriesReturn {
  // Tournées
  tournees: TourneeListResponse | null;
  tournee: Tournee | null;
  toursLoading: boolean;
  toursError: string | null;
  
  // Livraisons
  livraisons: LivraisonListResponse | null;
  livraison: Livraison | null;
  loading: boolean;
  deliveriesLoading: boolean;
  deliveriesError: string | null;

  // Tournée Methods
  fetchTournees: (params?: TourneeListParams) => Promise<void>;
  fetchTournee: (id: number) => Promise<void>;

  // Livraison Methods
  fetchLivraisons: (params?: LivraisonListParams) => Promise<void>;
  fetchLivraisonsByCommande: (commandeId: number) => Promise<void>;
  fetchLivraison: (id: number) => Promise<void>;
  deleteLivraison: (id: number) => Promise<{ message: string }>;

  // Utilities
  clearTournee: () => void;
  clearLivraison: () => void;
  clearErrors: () => void;
}

export function useToursDeliveries(): UseToursDeliveriesReturn {
  const [tournees, setTournees] = useState<TourneeListResponse | null>(null);
  const [tournee, setTournee] = useState<Tournee | null>(null);
  const [toursLoading, setToursLoading] = useState<boolean>(false);
  const [toursError, setToursError] = useState<string | null>(null);

  const [livraisons, setLivraisons] = useState<LivraisonListResponse | null>(null);
  const [livraison, setLivraison] = useState<Livraison | null>(null);
  const [deliveriesLoading, setDeliveriesLoading] = useState<boolean>(false);
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null);

  const fetchTournees = useCallback(async (params?: TourneeListParams): Promise<void> => {
    setToursLoading(true);
    setToursError(null);
    
    try {
      const response = await toursApi.list(params);
      setTournees(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tours";
      setToursError(errorMessage);
      throw err;
    } finally {
      setToursLoading(false);
    }
  }, []);

  const fetchTournee = useCallback(async (id: number): Promise<void> => {
    setToursLoading(true);
    setToursError(null);
    
    try {
      const response = await toursApi.get(id);
      setTournee(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tour";
      setToursError(errorMessage);
      throw err;
    } finally {
      setToursLoading(false);
    }
  }, []);

  const fetchLivraisons = useCallback(async (params?: LivraisonListParams): Promise<void> => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    
    try {
      const response = await deliveriesApi.list(params);
      setLivraisons(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch deliveries";
      setDeliveriesError(errorMessage);
      throw err;
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  const fetchLivraisonsByCommande = useCallback(async (commandeId: number): Promise<void> => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    
    try {
      const response = await deliveriesApi.list({ commande_id: commandeId });
      setLivraisons(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch deliveries for order";
      setDeliveriesError(errorMessage);
      throw err;
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  const fetchLivraison = useCallback(async (id: number): Promise<void> => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    
    try {
      const response = await deliveriesApi.get(id);
      setLivraison(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch delivery";
      setDeliveriesError(errorMessage);
      throw err;
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  const deleteLivraison = useCallback(async (id: number): Promise<{ message: string }> => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    
    try {
      const response = await deliveriesApi.delete(id);
      
      // Remove from deliveries list if it exists
      if (livraisons?.results) {
        setLivraisons(prev => ({
          count: (prev?.count ?? 1) - 1,
          results: (prev?.results ?? []).filter(item => item.id !== id)
        }));
      }
      
      // Clear current delivery if it's the same
      if (livraison?.id === id) {
        setLivraison(null);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete delivery";
      setDeliveriesError(errorMessage);
      throw err;
    } finally {
      setDeliveriesLoading(false);
    }
  }, [livraison, livraisons]);

  const clearTournee = useCallback(() => {
    setTournee(null);
    setToursError(null);
  }, []);

  const clearLivraison = useCallback(() => {
    setLivraison(null);
    setDeliveriesError(null);
  }, []);

  const clearErrors = useCallback(() => {
    setToursError(null);
    setDeliveriesError(null);
  }, []);

  return {
    // Tournées
    tournees,
    tournee,
    toursLoading,
    toursError,
    
    // Livraisons
    livraisons,
    livraison,
    loading: deliveriesLoading,
    deliveriesLoading,
    deliveriesError,

    // Tournée Methods
    fetchTournees,
    fetchTournee,

    // Livraison Methods
    fetchLivraisons,
    fetchLivraisonsByCommande,
    fetchLivraison,
    deleteLivraison,

    // Utilities
    clearTournee,
    clearLivraison,
    clearErrors,
  };
}