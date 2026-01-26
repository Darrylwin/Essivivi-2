/**
 * =====================================================
 * Types - Commandes
 * =====================================================
 * Définitions TypeScript pour la gestion des commandes
 * 
 * @module lib/types/orders.types
 * @version 1.0
 */

// ========== COMMANDE MODEL ==========
export type StatutCommande = 'en_attente' | 'acceptee' | 'en_cours' | 'livree' | 'annulee';

export interface LigneCommande {
  id: number;
  produit: number;
  produit_detail: {
    id: number;
    nom: string;
    marque: string;
    volume: string | null;
    prix_unitaire: string;
  };
  quantite: number;
  prix_unitaire: string;
  montant: string;
  created_at: string;
}

export interface Commande {
  id: number;
  client: number;
  client_code: string;
  client_nom: string;
  client_responsable: string;
  client_telephone: string;
  client_latitude: string | null;
  client_longitude: string | null;
  agent: number | null;
  agent_numero: string | null;
  agent_nom_complet: string | null;
  agent_telephone: string | null;
  lignes: LigneCommande[];
  quantite_totale: number;
  montant_total: string;
  latitude_livraison: string;
  longitude_livraison: string;
  statut: StatutCommande;
  est_assignee: boolean;
  distance_client_livraison: number | null;
  created_at: string;
  updated_at: string;
}

// ========== COMMANDE LISTE ==========
export interface CommandeListItem {
  id: number;
  client: number;
  client_code: string;
  client_nom: string;
  agent: number | null;
  agent_numero: string | null;
  agent_nom: string | null;
  est_assignee: boolean;
  quantite_totale: number;
  montant_total: string;
  latitude_livraison: string;
  longitude_livraison: string;
  statut: StatutCommande;
  created_at: string;
}

// ========== AGENT DISPONIBLE ==========
export interface AgentDisponible {
  id: number;
  numero_identification: string;
  nom: string;
  prenom: string;
  telephone: string;
  statut: string;
  tricycle: string | null;
  derniere_position: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
}

// ========== REQUESTS ==========
export interface CommandeAssignRequest {
  agent_id: number;
}

export interface CommandeStatusRequest {
  statut: StatutCommande;
}

// ========== RESPONSES ==========
export interface CommandeListResponse {
  count: number;
  results: CommandeListItem[];
}

export interface CommandeAssignResponse {
  message: string;
  instructions: string;
  commande: Commande;
}

export interface CommandeStatusResponse {
  message: string;
  commande: Commande;
}

export interface AgentsDisponiblesResponse {
  count: number;
  agents: AgentDisponible[];
  note: string;
}

// ========== QUERY PARAMS ==========
export interface CommandeListParams {
  statut?: StatutCommande;
  agent_id?: number;
  client_id?: number;
  search?: string;
}