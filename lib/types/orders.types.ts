// orders.types.ts
/**
 * =====================================================
 * Types - Commandes (Orders)
 * =====================================================
 * Définitions TypeScript pour la gestion des commandes
 * 
 * @module lib/types/orders.types
 * @version 1.0
 */

// ========== ENUMS ==========
export type CommandeStatut = 
  | 'en_attente'
  | 'acceptee'
  | 'en_cours'
  | 'livree'
  | 'annulee';

export type NotificationType = 
  | 'nouvelle_commande'
  | 'livraison_assignee'
  | 'livraison_terminee'
  | 'commande_annulee';

// ========== MODELS ==========
export interface LigneCommande {
  id: number;
  produit: number;
  produit_detail?: {
    id: number;
    nom: string;
    categorie: string;
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
  client_responsable?: string;
  client_telephone?: string;
  client_latitude?: string;
  client_longitude?: string;
  
  agent: number | null;
  agent_numero: string | null;
  agent_nom: string | null;
  agent_nom_complet?: string;
  agent_telephone?: string | null;
  
  quantite_demandee: number | null;
  quantite_totale: number;
  montant_total: string;
  
  latitude_livraison: string;
  longitude_livraison: string;
  
  statut: CommandeStatut;
  est_assignee: boolean;
  
  distance_client_livraison?: number | null;
  
  lignes?: LigneCommande[];
  
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  titre: string;
  message: string;
  lue: boolean;
  
  agent: number | null;
  agent_numero: string | null;
  
  client: number | null;
  client_code: string | null;
  
  commande: number | null;
  commande_id: number | null;
  
  created_at: string;
}

// ========== REQUEST/RESPONSE TYPES ==========
// Liste des commandes
export interface CommandeListRequest {
  statut?: CommandeStatut;
  search?: string;
  lat?: number;
  lon?: number;
  distance_max?: number;
  agent_id?: number;
  client_id?: number;
}

export interface CommandeListResponse {
  count: number;
  results: Commande[];
}

// Détail d'une commande
export interface CommandeDetailResponse {
  id: number;
  client: number;
  client_code: string;
  client_nom: string;
  client_responsable: string;
  client_telephone: string;
  client_latitude: string;
  client_longitude: string;
  
  agent: number | null;
  agent_numero: string | null;
  agent_nom_complet: string | null;
  agent_telephone: string | null;
  
  lignes: LigneCommande[];
  quantite_totale: number;
  montant_total: string;
  
  latitude_livraison: string;
  longitude_livraison: string;
  
  statut: CommandeStatut;
  est_assignee: boolean;
  distance_client_livraison: number | null;
  
  created_at: string;
  updated_at: string;
}

// Assignation d'une commande
export interface CommandeAssignRequest {
  agent_id: number;
}

export interface CommandeAssignResponse {
  message: string;
  commande: CommandeDetailResponse;
}

// Changement de statut
export interface CommandeStatusRequest {
  statut: CommandeStatut;
}

export interface CommandeStatusResponse {
  message: string;
  commande: CommandeDetailResponse;
}

// Mise à jour d'une commande (coordonnées)
export interface CommandeUpdateRequest {
  latitude_livraison?: string;
  longitude_livraison?: string;
}

export interface CommandeUpdateResponse {
  message: string;
  commande: CommandeDetailResponse;
}

// Notifications
export interface NotificationListRequest {
  lue?: boolean;
}

export interface NotificationListResponse {
  count: number;
  results: Notification[];
}

export interface NotificationMarkAsReadResponse {
  message: string;
  notification: Notification;
}

// ========== FILTERING ==========
export interface CommandeFilters {
  statut?: CommandeStatut;
  agent_id?: number;
  client_id?: number;
  search?: string;
  lat?: number;
  lon?: number;
  distance_max?: number;
}

export interface NotificationFilters {
  lue?: boolean;
}