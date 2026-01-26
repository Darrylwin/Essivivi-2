/**
 * =====================================================
 * Types - Tracking & Dashboard
 * =====================================================
 * Définitions TypeScript pour le tracking GPS et le dashboard
 * 
 * @module lib/types/tracking-dashboard.types
 * @version 1.0
 */

// ========== POSITION AGENT MODEL ==========
export interface PositionAgent {
  id: number;
  agent: number;
  agent_numero: string;
  agent_nom: string;
  agent_prenom: string;
  agent_telephone: string;
  tournee: number | null;
  tournee_id: number | null;
  latitude: string;
  longitude: string;
  precision: number | null;
  vitesse: number | null;
  altitude: number | null;
  timestamp: string;
  distance_depuis_derniere: number;
}

// ========== POSITION LISTE ==========
export interface PositionListItem {
  id: number;
  agent: number;
  agent_numero: string;
  agent_nom: string;
  latitude: string;
  longitude: string;
  vitesse: number | null;
  timestamp: string;
}

// ========== AGENT EN TOURNEE (LIVE) ==========
export interface AgentEnTournee {
  agent_id: number;
  agent_numero: string;
  agent_nom: string;
  agent_prenom: string;
  agent_telephone: string;
  derniere_position: {
    latitude: number;
    longitude: number;
    vitesse: number | null;
    timestamp: string;
  } | null;
  temps_depuis_derniere_position: number | null;
}

// ========== PARCOURS AGENT ==========
export interface ParcoursAgent {
  agent: {
    id: number;
    numero: string;
    nom: string;
  };
  tournee_id: number;
  nombre_positions: number;
  distance_totale_metres: number;
  distance_totale_km: number;
  positions: PositionListItem[];
}

// ========== DASHBOARD MODEL ==========
export interface DashboardStats {
  agents_actifs: number;
  agents_en_tournee: number;
  livraisons_aujourdhui: number;
  quantite_totale_aujourdhui: number;
  montant_total_aujourdhui: string;
  commandes_en_attente: number;
  livraisons_hier: number;
  evolution_livraisons: number;
  montant_hier: string;
  evolution_montant: number;
}

// ========== QUERY PARAMS ==========
export interface PositionListParams {
  agent_id?: number;
  date?: string;
  heure_debut?: string;
  heure_fin?: string;
}