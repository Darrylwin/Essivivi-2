/**
 * =====================================================
 * Types - Produits
 * =====================================================
 * Définitions TypeScript pour la gestion des produits
 * 
 * @module lib/types/products.types
 * @version 1.0
 */

// ========== PRODUIT MODEL ==========
export type UniteVente = 'sachet' | 'bouteille' | 'canette' | 'pack';

export interface Produit {
  id: number;
  nom: string;
  marque: string;
  volume: string | null;
  unite_vente: UniteVente;
  prix_unitaire: string;
  photo: string | null;
  categorie: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

// ========== PRODUIT LISTE ==========
export interface ProduitListItem {
  id: number;
  nom: string;
  marque: string;
  volume: string | null;
  unite_vente: UniteVente;
  prix_unitaire: string;
  categorie: number;
  categorie_nom: string;
  actif: boolean;
}

// ========== PRODUIT DETAIL ==========
export interface ProduitDetail extends Produit {
  categorie_detail: {
    id: number;
    nom: string;
    actif: boolean;
    nombre_produits: number;
  };
}

// ========== REQUESTS ==========
export interface ProduitCreateRequest {
  categorie_id: number;
  nom: string;
  marque: string;
  volume?: string;
  unite_vente: UniteVente;
  prix_unitaire: number;
  photo?: File;
  actif?: boolean;
}

export interface ProduitUpdateRequest {
  categorie_id?: number;
  nom?: string;
  marque?: string;
  volume?: string;
  unite_vente?: UniteVente;
  prix_unitaire?: number;
  photo?: File;
  actif?: boolean;
}

// ========== RESPONSES ==========
export interface ProduitListResponse {
  count: number;
  results: ProduitListItem[];
}

export interface ProduitCreateResponse {
  message: string;
  produit: ProduitDetail;
}

export interface ProduitUpdateResponse {
  message: string;
  produit: ProduitDetail;
}

export interface ProduitDeleteResponse {
  message: string;
}

// ========== QUERY PARAMS ==========
export interface ProduitListParams {
  categorie_id?: number;
  actif?: boolean;
  search?: string;
}