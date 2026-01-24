/**
 * =====================================================
 * API Client - Authentification
 * =====================================================
 * Client pour les endpoints d'authentification
 *
 * @module lib/api/auth.api
 * @version 1.0
 */

import { apiClient } from "./client";
import type {
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  RefreshTokenResponse,
  UserResponse,
} from "../types";

export class AuthApi {
  private client = apiClient;

  /**
   * Connexion utilisateur
   * POST /api/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.client.post<AuthResponse>("/api/login/", data);
  }

  /**
   * Rafraîchir le token d'accès
   * POST /api/login/refresh
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.client.post<RefreshTokenResponse>("/api/login/refresh", data);
  }

  /**
   * Récupérer un utilisateur par ID
   * GET /api/auth/users/:id
   * Requiert: Bearer token
   */
  async getUserById(userId: string): Promise<UserResponse> {
    return this.client.get<UserResponse>(`/api/auth/users/${userId}`);
  }
}

// Instance singleton exportée
export const authApi = new AuthApi();
