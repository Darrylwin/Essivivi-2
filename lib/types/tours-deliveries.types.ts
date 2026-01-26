/**
 * =====================================================
 * Types - Tournées & Livraisons
 * =====================================================
 * Définitions TypeScript pour les tournées et livraisons
 * 
 * @module lib/types/tours-deliveries.types
 * @version 1.0
 */

// ========== TOURNEE MODEL ==========
export interface Tournee {
  id: number;
  agent: number;
  agent_numero: string;
  agent_nom: string;
  agent_prenom: string;
  agent_telephone: string;
  commande: number;
  heure_debut: string;
  heure_fin: string | null;
  duree_formatee: string;
  est_terminee: boolean;
  nombre_livraisons: number;
  quantite_totale_livree: number;
  montant_total_percu: number;
  created_at: string;
  updated_at: string;
}

// ========== TOURNEE LISTE ==========
export interface TourneeListItem {
  id: number;
  agent: number;
  commande: number;
  heure_debut: string;
  heure_fin: string | null;
  created_at: string;
}

// ========== LIVRAISON MODEL ==========
export type StatutLivraison = 'en_attente' | 'validee' | 'livree' | 'annulee';

export interface LigneLivraison {
  id: number;
  produit: number;
  produit_detail: {
    id: number;
    nom: string;
    marque: string;
    volume: string | null;
    prix_unitaire: string;
  };
  ligne_commande: number | null;
  ligne_commande_id: number | null;
  quantite: number;
  prix_unitaire: string;
  montant: string;
  created_at: string;
}

export interface Livraison {
  id: number;
  agent: number;
  agent_numero: string;
  agent_nom: string;
  agent_prenom: string;
  agent_telephone: string;
  client: number;
  client_code: string;
  client_nom: string;
  client_responsable: string;
  client_telephone: string;
  client_adresse: string;
  commande: number | null;
  commande_id: number | null;
  tournee: number | null;
  tournee_id: number | null;
  latitude: string;
  longitude: string;
  distance_client: number | null;
  distance_commande: number | null;
  lignes: LigneLivraison[];
  quantite_totale: number;
  montant_total: string;
  date_livraison: string;
  heure_livraison: string;
  duree_livraison: string | null;
  statut: StatutLivraison;
  created_at: string;
  updated_at: string;
}

// ========== LIVRAISON LISTE ==========
export interface LivraisonListItem {
  id: number;
  agent: number;
  agent_numero: string;
  agent_nom: string;
  agent_prenom: string;
  client: number;
  client_code: string;
  client_nom: string;
  commande: number | null;
  commande_id: number | null;
  quantite_totale: number;
  montant_total: string;
  date_livraison: string;
  heure_livraison: string;
  statut: StatutLivraison;
  created_at: string;
}

// ========== RESPONSES ==========
export interface TourneeListResponse {
  count: number;
  results: TourneeListItem[];
}

export interface LivraisonListResponse {
  count: number;
  results: LivraisonListItem[];
}

// ========== QUERY PARAMS ==========
export interface TourneeListParams {
  agent_id?: number;
  date?: string;
}

export interface LivraisonListParams {
  date?: string;
  client_id?: number;
  agent_id?: number;
  commande_id?: number;
  search?: string;
}