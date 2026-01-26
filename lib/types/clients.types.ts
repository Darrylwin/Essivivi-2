/**
 * =====================================================
 * Types - Clients
 * =====================================================
 * Définitions TypeScript pour la gestion des clients
 * 
 * @module lib/types/clients.types
 * @version 1.0
 */

// ========== CLIENT MODEL ==========
export type TypeClient = 'detaillant' | 'grossiste' | 'institution';
export type StatutClient = 'actif' | 'inactif';

export interface Client {
  id: number;
  code_client: string;
  nom_point_vente: string;
  nom_responsable: string;
  telephone: string;
  email: string;
  adresse: string;
  latitude: string | null;
  longitude: string | null;
  type_client: TypeClient;
  photo_point_vente: string | null;
  statut: StatutClient;
  date_inscription: string;
  created_at: string;
  updated_at: string;
}

// ========== CLIENT LISTE ==========
export interface ClientListItem {
  id: number;
  code_client: string;
  nom_point_vente: string;
  nom_responsable: string;
  telephone: string;
  email: string;
  adresse: string;
  type_client: TypeClient;
  statut: StatutClient;
  date_inscription: string;
}

// ========== REQUESTS ==========
export interface ClientCreateRequest {
  nom_point_vente: string;
  nom_responsable: string;
  telephone: string;
  email: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  type_client: TypeClient;
  photo_point_vente?: File;
  mot_de_passe: string;
}

export interface ClientUpdateRequest {
  nom_point_vente?: string;
  nom_responsable?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  type_client?: TypeClient;
  photo_point_vente?: File;
  statut?: StatutClient;
}

// ========== RESPONSES ==========
export interface ClientListResponse {
  count: number;
  results: ClientListItem[];
}

export interface ClientCreateResponse {
  message: string;
  client: Client;
}

export interface ClientUpdateResponse {
  message: string;
  client: Client;
}

export interface ClientDeleteResponse {
  message: string;
}

// ========== QUERY PARAMS ==========
export interface ClientListParams {
  type_client?: TypeClient;
  statut?: StatutClient;
  search?: string;
}