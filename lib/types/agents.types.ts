/**
 * =====================================================
 * Types - Agents & Tricycles
 * =====================================================
 * Définitions TypeScript pour la gestion des agents et tricycles
 * 
 * @module lib/types/agents.types
 * @version 1.0
 */

// ========== TRICYCLE MODEL ==========
export interface Tricycle {
  id: number;
  plaque_immatriculation: string;
  created_at: string;
  updated_at: string;
}

// ========== AGENT MODEL ==========
export type StatutAgent = 'actif' | 'inactif' | 'en_tournee';

export interface Agent {
  id: number;
  numero_identification: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  date_naissance: string;
  adresse: string;
  photo: string | null;
  tricycle: Tricycle | null;
  statut: StatutAgent;
  created_at: string;
  updated_at: string;
}

// ========== AGENT LISTE ==========
export interface AgentListItem {
  id: number;
  numero_identification: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  tricycle_plaque: string | null;
  statut: StatutAgent;
  created_at: string;
}

// ========== TRICYCLE REQUESTS ==========
export interface TricycleCreateRequest {
  plaque_immatriculation: string;
}

export interface TricycleUpdateRequest {
  plaque_immatriculation: string;
}

// ========== AGENT REQUESTS ==========
export interface AgentCreateRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  date_naissance: string;
  adresse: string;
  photo?: File;
  tricycle_id?: number | null;
  mot_de_passe?: string;
}

export interface AgentUpdateRequest {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  date_naissance?: string;
  adresse?: string;
  photo?: File;
  tricycle_id?: number | null;
  statut?: StatutAgent;
}

// ========== RESPONSES ==========
export interface AgentListResponse {
  count: number;
  results: AgentListItem[];
}

export interface AgentCreateResponse {
  message: string;
  agent: Agent;
  mot_de_passe_genere?: string;
}

export interface AgentUpdateResponse {
  message: string;
  agent: Agent;
}

export interface AgentDeleteResponse {
  message: string;
}

// ========== QUERY PARAMS ==========
export interface AgentListParams {
  statut?: StatutAgent;
  search?: string;
}