/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * =====================================================
 * Types - Gestion des Catégories & Produits (Admin)
 * =====================================================
 * Définitions TypeScript pour la gestion du catalogue produits
 * 
 * @module lib/types/products.types
 * @version 1.0
 */

// ========== UNITE DE VENTE ==========
export type UniteVente = 'sachet' | 'bouteille' | 'canette' | 'pack';

// ========== CATÉGORIE ==========
export interface CategorieBase {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategorieList extends Pick<CategorieBase, 'id' | 'nom' | 'actif'> {
  nombre_produits: number;
}

export interface CategorieDetail extends CategorieBase {
  nombre_produits: number;
}

export interface CategorieAvecProduits extends CategorieDetail {
  produits: ProduitList[];
}

export interface CategorieCreateRequest {
  nom: string;
  description?: string;
  actif?: boolean;
}

export interface CategorieUpdateRequest {
  nom?: string;
  description?: string | null;
  actif?: boolean;
}

// ========== PRODUIT ==========
export interface ProduitBase {
  id: number;
  nom: string;
  marque: string;
  volume: string | null;
  unite_vente: UniteVente;
  prix_unitaire: string; // Decimal en string
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProduitList extends ProduitBase {
  categorie: number;
  categorie_nom: string;
}

export interface ProduitDetail extends ProduitBase {
  photo: string | null;
  categorie: number;
  categorie_detail: CategorieList;
}

export interface ProduitCreateRequest {
  categorie_id: number;
  nom: string;
  marque: string;
  volume?: string | null;
  unite_vente: UniteVente;
  prix_unitaire: number; // Decimal en number pour la requête
  photo?: File | null;
  actif?: boolean;
}

export interface ProduitUpdateRequest {
  categorie_id?: number;
  nom?: string;
  marque?: string;
  volume?: string | null;
  unite_vente?: UniteVente;
  prix_unitaire?: number;
  photo?: File | null;
  actif?: boolean;
}

// ========== RESPONSES ==========
interface ListResponse<T> {
  count: number;
  results: T[];
}

export interface CategorieListResponse extends ListResponse<CategorieList> {}
export interface CategorieAvecProduitsResponse extends ListResponse<CategorieAvecProduits> {}

export interface ProduitListResponse extends ListResponse<ProduitList> {}

export interface CategorieDetailResponse {
  message?: string;
  categorie: CategorieDetail;
}

export interface ProduitDetailResponse {
  message?: string;
  produit: ProduitDetail;
}

export interface SimpleMessageResponse {
  message: string;
}

// ========== QUERY PARAMS ==========
export interface CategorieQueryParams {
  actif?: boolean;
  avec_produits?: boolean;
}

export interface ProduitQueryParams {
  categorie_id?: number;
  actif?: boolean;
  search?: string;
}

// ========== FORM VALUES ==========
export interface ProduitFormValues {
  categorie_id: number;
  nom: string;
  marque: string;
  volume: string;
  unite_vente: UniteVente;
  prix_unitaire: string;
  photo?: File | null;
  actif: boolean;
}

export interface CategorieFormValues {
  nom: string;
  description: string;
  actif: boolean;
}