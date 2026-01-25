/**
 * =====================================================
 * API - Index
 * =====================================================
 * Export centralisé de tous les clients API
 *
 * @module lib/api
 * @version 1.0
 */

// Client principal
export { apiClient, ApiClient, ApiError } from "./client";
export type { ApiResponse } from "./client";

// Clients API par catégorie
export { authApi, AuthApi } from "./auth.api";
export { usersApi, UsersApi } from "./users.api";
