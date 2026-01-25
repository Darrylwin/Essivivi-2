/**
 * =====================================================
 * Types - Authentification & Utilisateurs (Admin Web)
 * =====================================================
 * Définitions TypeScript pour l'auth admin web uniquement
 * 
 * @module lib/types/auth.types
 * @version 2.0
 */

// ========== ADMIN USER ==========
export interface Admin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: 'actif' | 'inactif';
  created_at?: string;
  updated_at?: string;
}

// ========== AUTH REQUESTS ==========
export interface AdminLoginRequest {
  email: string;
  mot_de_passe: string; // Note: mot_de_passe, pas password
}

// ========== AUTH RESPONSES ==========
export interface AdminAuthResponse {
  message: string;
  token: string; // JWT access token
  refresh: string; // JWT refresh token
  admin: Admin;
}

export interface AdminErrorResponse {
  error: string;
}

// ========== ACCOUNT INFO ==========
export interface AdminAccountInfo {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  statut: 'actif' | 'inactif';
  date_inscription: string;
  photo_url: string | null;
}

export interface AccountInfoResponse {
  user_type: 'admin';
  account_info: AdminAccountInfo;
}

// ========== CHANGE PASSWORD ==========
export interface ChangePasswordRequest {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// ========== UPDATE PHOTO ==========
export interface UpdatePhotoResponse {
  message: string;
  photo_url: string | null;
}

// ========== AUTH STATE ==========
export interface AuthState {
  user: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}