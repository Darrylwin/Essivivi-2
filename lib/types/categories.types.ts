/**
 * =====================================================
 * Types - Catégories de Produits
 * =====================================================
 * Définitions TypeScript pour la gestion des catégories
 * 
 * @module lib/types/categories.types
 * @version 1.0
 */

// ========== CATEGORIE MODEL ==========
export interface Categorie {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  nombre_produits: number;
  created_at: string;
  updated_at: string;
}

// ========== CATEGORIE COMPACT (LISTE) ==========
export interface CategorieListItem {
  id: number;
  nom: string;
  actif: boolean;
  nombre_produits: number;
}

// ========== CATEGORIE AVEC PRODUITS ==========
export interface CategorieAvecProduits extends Categorie {
  produits: Array<{
    id: number;
    nom: string;
    marque: string;
    volume: string | null;
    unite_vente: string;
    prix_unitaire: string;
    categorie: number;
    categorie_nom: string;
    actif: boolean;
  }>;
}

// ========== REQUESTS ==========
export interface CategorieCreateRequest {
  nom: string;
  description?: string;
  actif?: boolean;
}

export interface CategorieUpdateRequest {
  nom?: string;
  description?: string;
  actif?: boolean;
}

// ========== RESPONSES ==========
export interface CategorieListResponse {
  count: number;
  results: CategorieListItem[];
}

export interface CategorieDetailResponse extends Categorie {
  produits?: Array<{
    id: number;
    nom: string;
    marque: string;
    volume: string | null;
    unite_vente: string;
    prix_unitaire: string;
    categorie: number;
    categorie_nom: string;
    actif: boolean;
  }>;
}

export interface CategorieCreateResponse {
  message: string;
  categorie: Categorie;
}

export interface CategorieUpdateResponse {
  message: string;
  categorie: Categorie;
}

export interface CategorieDeleteResponse {
  message: string;
}

// ========== QUERY PARAMS ==========
export interface CategorieListParams {
  actif?: boolean;
  avec_produits?: boolean;
}