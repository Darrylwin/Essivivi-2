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
  UpdateUserRequest,
  AuthResponse,
  RefreshTokenResponse,
  UsersListResponse,
  UserResponse,
  UpdateUserResponse,
} from "../types";

export class AuthApi {
  private client = apiClient;

  /**
   * Connexion utilisateur
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.client.post<AuthResponse>("/login", data);
  }

  /**
   * Rafraîchir le token d'accès
   * POST /api/auth/refresh
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.client.post<RefreshTokenResponse>("/api/auth/refresh", data);
  }

  /**
   * Liste tous les utilisateurs (Admin uniquement)
   * GET /api/auth/users
   * Requiert: Bearer token + admin
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    permissions?: string;
  }): Promise<UsersListResponse> {
    return this.client.get<UsersListResponse>("/api/auth/users", params);
  }

  /**
   * Récupérer un utilisateur par ID
   * GET /api/auth/users/:id
   * Requiert: Bearer token
   */
  async getUserById(userId: string): Promise<UserResponse> {
    return this.client.get<UserResponse>(`/api/auth/users/${userId}`);
  }

  /**
   * Mettre à jour un utilisateur (Admin uniquement)
   * PUT /api/auth/users/:id
   * Requiert: Bearer token + admin
   */
  async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UpdateUserResponse> {
    return this.client.put<UpdateUserResponse>(
      `/api/auth/users/${userId}`,
      data
    );
  }
}

// Instance singleton exportée
export const authApi = new AuthApi();
