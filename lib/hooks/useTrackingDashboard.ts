/**
 * =====================================================
 * Hook - Tracking & Dashboard
 * =====================================================
 * Hook React pour le tracking GPS et le dashboard
 * 
 * @module lib/hooks/useTrackingDashboard
 * @version 1.0
 */

"use client";

import { useState, useCallback } from "react";
import { trackingApi, dashboardApi } from "../api";
import type {
  PositionAgent,
  PositionListParams,
  AgentEnTournee,
  ParcoursAgent,
  DashboardStats,
} from "../types";

interface UseTrackingDashboardReturn {
  // Tracking
  positions: PositionAgent[] | null;
  position: PositionAgent | null;
  agentsEnTournee: AgentEnTournee[] | null;
  parcours: ParcoursAgent | null;
  trackingLoading: boolean;
  trackingError: string | null;
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Tracking Methods
  fetchPositions: (params?: PositionListParams) => Promise<void>;
  fetchPosition: (id: number) => Promise<void>;
  fetchAgentsEnTournee: () => Promise<void>;
  fetchParcours: (agentId: number, tourneeId: number) => Promise<void>;

  // Dashboard Methods
  fetchDashboardStats: () => Promise<void>;

  // Utilities
  clearTracking: () => void;
  clearDashboard: () => void;
  clearErrors: () => void;
}

export function useTrackingDashboard(): UseTrackingDashboardReturn {
  const [positions, setPositions] = useState<PositionAgent[] | null>(null);
  const [position, setPosition] = useState<PositionAgent | null>(null);
  const [agentsEnTournee, setAgentsEnTournee] = useState<AgentEnTournee[] | null>(null);
  const [parcours, setParcours] = useState<ParcoursAgent | null>(null);
  const [trackingLoading, setTrackingLoading] = useState<boolean>(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchPositions = useCallback(async (params?: PositionListParams): Promise<void> => {
    setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const response = await trackingApi.listPositions(params);
      setPositions(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch positions";
      setTrackingError(errorMessage);
      throw err;
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const fetchPosition = useCallback(async (id: number): Promise<void> => {
    setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const response = await trackingApi.getPosition(id);
      setPosition(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch position";
      setTrackingError(errorMessage);
      throw err;
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const fetchAgentsEnTournee = useCallback(async (): Promise<void> => {
    setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const response = await trackingApi.getAgentsEnTournee();
      setAgentsEnTournee(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch agents in tour";
      setTrackingError(errorMessage);
      throw err;
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const fetchParcours = useCallback(async (agentId: number, tourneeId: number): Promise<void> => {
    setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const response = await trackingApi.getParcours(agentId, tourneeId);
      setParcours(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch route";
      setTrackingError(errorMessage);
      throw err;
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async (): Promise<void> => {
    setDashboardLoading(true);
    setDashboardError(null);
    
    try {
      const response = await dashboardApi.getStats();
      setDashboardStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats";
      setDashboardError(errorMessage);
      throw err;
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const clearTracking = useCallback(() => {
    setPositions(null);
    setPosition(null);
    setAgentsEnTournee(null);
    setParcours(null);
    setTrackingError(null);
  }, []);

  const clearDashboard = useCallback(() => {
    setDashboardStats(null);
    setDashboardError(null);
  }, []);

  const clearErrors = useCallback(() => {
    setTrackingError(null);
    setDashboardError(null);
  }, []);

  return {
    // Tracking
    positions,
    position,
    agentsEnTournee,
    parcours,
    trackingLoading,
    trackingError,
    
    // Dashboard
    dashboardStats,
    dashboardLoading,
    dashboardError,

    // Tracking Methods
    fetchPositions,
    fetchPosition,
    fetchAgentsEnTournee,
    fetchParcours,

    // Dashboard Methods
    fetchDashboardStats,

    // Utilities
    clearTracking,
    clearDashboard,
    clearErrors,
  };
}