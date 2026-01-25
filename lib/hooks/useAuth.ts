/* eslint-disable react-hooks/set-state-in-effect */
/**
 * =====================================================
 * Hook - Authentification Admin
 * =====================================================
 * Hook React pour la gestion de l'authentification admin web
 * 
 * @module lib/hooks/useAuth
 * @version 2.1
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { authApi, apiClient } from "../api";
import type { 
  Admin, 
  AdminLoginRequest, 
  AdminAuthResponse,
  AuthState,
  AccountInfoResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdatePhotoResponse
} from "../types";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true, // Commence par loading pour restoration
  });

  /**
   * Nettoyer la session (logout)
   */
  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_access_token");
      sessionStorage.removeItem("admin_refresh_token");
      sessionStorage.removeItem("admin_user");
    }
    
    apiClient.clearTokens();
    
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  /**
   * Connexion administrateur
   */
  const login = useCallback(async (credentials: AdminLoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.adminLogin(credentials);

      // Mettre à jour les tokens dans le client API
      apiClient.setTokens(response.token, response.refresh);

      // Structure admin depuis la réponse
      const adminUser: Admin = {
        id: response.admin.id,
        nom: response.admin.nom,
        prenom: response.admin.prenom,
        email: response.admin.email,
        statut: response.admin.statut,
      };

      setState({
        user: adminUser,
        accessToken: response.token,
        refreshToken: response.refresh,
        isAuthenticated: true,
        isLoading: false,
      });

      // Stocker en sessionStorage (plus sécurisé que localStorage pour une session)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_access_token", response.token);
        sessionStorage.setItem("admin_refresh_token", response.refresh);
        sessionStorage.setItem("admin_user", JSON.stringify(adminUser));
      }

      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Restaurer la session depuis sessionStorage
   */
  const restoreSession = useCallback(async () => {
    if (typeof window === "undefined") {
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    const accessToken = sessionStorage.getItem("admin_access_token");
    const refreshToken = sessionStorage.getItem("admin_refresh_token");
    const userStr = sessionStorage.getItem("admin_user");

    if (!accessToken || !refreshToken || !userStr) {
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    try {
      const user: Admin = JSON.parse(userStr);
      
      // Vérifier si le token est toujours valide en appelant l'API
      apiClient.setTokens(accessToken, refreshToken);
      
      // Vérifier que l'utilisateur existe toujours côté serveur
      try {
        await authApi.getAccountInfo();
        
        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      } catch (error) {
        // Token invalide ou expiré, nettoyer la session
        clearSession();
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      clearSession();
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [clearSession]); // Ajout de la dépendance

  /**
   * Changer le mot de passe
   */
  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return authApi.changePassword(data);
  }, []);

  /**
   * Mettre à jour la photo de profil
   */
  const updatePhoto = useCallback(async (photoFile: File): Promise<UpdatePhotoResponse> => {
    const response = await authApi.updatePhoto(photoFile);
    
    // Mettre à jour l'utilisateur dans le state si besoin
    if (state.user) {
      // Note: L'API ne retourne pas les infos utilisateur mises à jour
      // On pourrait recharger les infos du compte
    }
    
    return response;
  }, [state.user]);

  /**
   * Rafraîchir les infos du compte depuis l'API
   */
  const refreshAccountInfo = useCallback(async () => {
    try {
      const response = await authApi.getAccountInfo();
      
      if (response.user_type === 'admin') {
        const adminUser: Admin = {
          id: response.account_info.id,
          nom: response.account_info.nom,
          prenom: response.account_info.prenom,
          email: response.account_info.email,
          statut: response.account_info.statut,
        };
        
        setState(prev => ({
          ...prev,
          user: adminUser,
        }));
        
        // Mettre à jour sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_user", JSON.stringify(adminUser));
        }
      }
    } catch (error) {
      console.error("Failed to refresh account info:", error);
      throw error;
    }
  }, []);

  /**
   * Initialiser la session au montage du composant
   */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return {
    // State
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    
    // Actions
    login,
    logout: clearSession,
    changePassword,
    updatePhoto,
    refreshAccountInfo,
    restoreSession,
    
    // Helpers
    isAdmin: state.user?.statut === 'actif',
    isActive: state.user?.statut === 'actif',
    
    // Full name
    fullName: state.user ? `${state.user.prenom} ${state.user.nom}`.trim() : '',
  };
}