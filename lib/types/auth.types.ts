/**
 * =====================================================
 * Types - Authentification & Utilisateurs
 * =====================================================
 * Définitions TypeScript pour l'auth et la gestion users
 *
 * @module lib/types/auth.types
 * @version 1.0
 */

// ========== PERMISSIONS ==========
export type UserPermission = "admin";

// ========== USER ==========
export interface User {
  id: string;
  permissions: UserPermission;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

// ========== AUTH REQUESTS ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ========== AUTH RESPONSES ==========
export interface AuthResponse {
  message: string;
  user: User;
  refreshToken: string;
  accessToken: string;
}

export interface RefreshTokenResponse {
  refreshToken: string;
  accessToken: string;
  user?: User;
}

// ========== USER RESPONSES ==========
export interface UserResponse {
  user: User;
}

// ========== AUTH STATE ==========
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
