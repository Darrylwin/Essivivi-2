/**
 * =====================================================
 * API Client - Authentification (Admin Web)
 * =====================================================
 * Client pour les endpoints d'authentification admin web
 * 
 * @module lib/auth.api
 * @version 2.0
 */

import { apiClient } from "./client";
import type {
  AdminLoginRequest,
  AdminAuthResponse,
  AccountInfoResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdatePhotoResponse,
} from "../types";

export class AuthApi {
  private client = apiClient;

  /**
   * Connexion administrateur (web uniquement)
   * POST /auth/admin/login
   */
  async adminLogin(data: AdminLoginRequest): Promise<AdminAuthResponse> {
    return this.client.post<AdminAuthResponse>("/auth/admin/login", data);
  }

  /**
   * Récupérer les informations du compte admin
   * GET /auth/me
   * Requiert: Bearer token
   */
  async getAccountInfo(): Promise<AccountInfoResponse> {
    return this.client.get<AccountInfoResponse>("/auth/me");
  }

  /**
   * Récupérer le profil admin (format simplifié)
   * GET /profile
   * Requiert: Bearer token
   */
  async getProfile(): Promise<AccountInfoResponse> {
    return this.client.get<AccountInfoResponse>("/profile");
  }

  /**
   * Changer le mot de passe admin
   * PUT /profile/password
   * Requiert: Bearer token
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return this.client.put<ChangePasswordResponse>("/profile/password", data);
  }

  /**
   * Mettre à jour la photo de profil admin
   * PUT /profile/photo
   * Requiert: Bearer token + multipart/form-data
   */
  async updatePhoto(photoFile: File): Promise<UpdatePhotoResponse> {
    const formData = new FormData();
    formData.append("photo", photoFile);

    return this.client.put<UpdatePhotoResponse>(
      "/profile/photo",
      formData,
      {
        // Note: Content-Type sera automatiquement défini par fetch pour FormData
        "Accept": "application/json",
      }
    );
  }

  /**
   * Déconnexion (suppression des tokens côté client)
   * Note: L'API n'a pas d'endpoint logout, on gère côté client
   */
  logout(): void {
    this.client.clearTokens();
  }
}

// Instance singleton exportée
export const authApi = new AuthApi();