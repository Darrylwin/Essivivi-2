/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * =====================================================
 * Types - Gestion des Utilisateurs (Admin)
 * =====================================================
 * Définitions TypeScript pour la gestion des agents et clients
 * 
 * @module lib/types/users.types
 * @version 1.0
 */

// ========== TRICYCLE ==========
export interface Tricycle {
  id: number;
  plaque_immatriculation: string;
  created_at: string;
  updated_at: string;
}

// ========== AGENT ==========
export interface AgentBase {
  id: number;
  numero_identification: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'en_tournee';
  created_at: string;
  updated_at?: string;
}

export interface AgentList extends AgentBase {
  tricycle_plaque?: string | null;
}

export interface AgentDetail extends AgentBase {
  date_naissance: string;
  adresse: string;
  photo?: string | null;
  tricycle?: Tricycle | null;
}

export interface AgentCreateRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  date_naissance: string; // YYYY-MM-DD
  adresse: string;
  photo?: File | null;
  tricycle_id?: number | null;
  mot_de_passe?: string; // optionnel
}

export interface AgentUpdateRequest {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  date_naissance?: string;
  adresse?: string;
  photo?: File | null;
  tricycle_id?: number | null;
  statut?: 'actif' | 'inactif' | 'en_tournee';
}

export interface AgentChangePasswordRequest {
  nouveau_mot_de_passe: string;
}

// ========== CLIENT ==========
export interface ClientBase {
  id: number;
  code_client: string;
  nom_point_vente: string;
  nom_responsable: string;
  telephone: string;
  email: string;
  adresse: string;
  type_client: 'détaillant' | 'grossiste' | 'institution';
  statut: 'actif' | 'inactif';
  date_inscription: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientList extends ClientBase {}

export interface ClientDetail extends ClientBase {
  latitude: string | null;
  longitude: string | null;
  photo_point_vente: string | null;
}

export interface ClientCreateRequest {
  nom_point_vente: string;
  nom_responsable: string;
  telephone: string;
  email: string;
  adresse: string;
  latitude?: number | null;
  longitude?: number | null;
  type_client: 'détaillant' | 'grossiste' | 'institution';
  photo_point_vente?: File | null;
  mot_de_passe: string;
}

export interface ClientUpdateRequest {
  nom_point_vente?: string;
  nom_responsable?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  latitude?: number | null;
  longitude?: number | null;
  type_client?: 'détaillant' | 'grossiste' | 'institution';
  photo_point_vente?: File | null;
  statut?: 'actif' | 'inactif';
}

// ========== RESPONSES ==========
interface ListResponse<T> {
  count: number;
  results: T[];
}

export interface AgentListResponse extends ListResponse<AgentList> {}
export interface ClientListResponse extends ListResponse<ClientList> {}

export interface AgentDetailResponse {
  agent: AgentDetail;
  message?: string;
  mot_de_passe_genere?: string;
}

export interface ClientDetailResponse {
  client: ClientDetail;
  message?: string;
}

// ========== QUERY PARAMS ==========
export interface AgentQueryParams {
  statut?: 'actif' | 'inactif' | 'en_tournee';
  search?: string;
}

export interface ClientQueryParams {
  type_client?: 'détaillant' | 'grossiste' | 'institution';
  statut?: 'actif' | 'inactif';
  search?: string;
}