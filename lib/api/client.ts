/**
 * =====================================================
 * API Client Principal
 * =====================================================
 * Client HTTP de base pour toutes les requêtes API
 * Gère l'authentification, les headers et les erreurs
 * 
 * @module lib/api/client
 * @version 1.3 - Correction des headers
 */

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export class ApiError extends Error {
  constructor(
    message: string, 
    public status: number, 
    public code?: string,
    public rawResponse?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private logEnabled = process.env.NODE_ENV !== 'production';

  constructor(baseURL?: string) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  /**
   * Active/désactive les logs
   */
  setLogEnabled(enabled: boolean) {
    this.logEnabled = enabled;
  }

  /**
   * Log une requête API
   */
  private logRequest(method: string, endpoint: string, data?: any) {
    if (!this.logEnabled) return;
    
    console.group(`📤 API Request: ${method} ${endpoint}`);
    console.log('URL:', `${this.baseURL}${endpoint}`);
    if (data && method !== 'GET') {
      console.log('Request Data:', data);
    }
    console.log('Access Token:', this.accessToken ? 'Present' : 'None');
    console.groupEnd();
  }

  /**
   * Log une réponse API
   */
  private logResponse(method: string, endpoint: string, response: Response | ApiError | null, data?: any, duration?: number) {
    if (!this.logEnabled) return;
    
    console.group(`📥 API Response: ${method} ${endpoint}`);
    if (response instanceof ApiError) {
      console.log('Status:', response.status, response.message);
    } else if (response) {
      console.log('Status:', response.status, response.statusText);
    } else {
      console.log('Status: N/A');
    }
    console.log('Duration:', duration ? `${duration}ms` : 'N/A');
    console.log('Response Data:', data);
    console.groupEnd();
  }

  /**
   * Définit les tokens d'authentification
   */
  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (this.logEnabled) {
      console.log('🔐 Tokens set:', { 
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken 
      });
    }
  }

  /**
   * Récupère le token d'accès actuel
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Récupère le refresh token actuel
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Supprime les tokens (logout)
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (this.logEnabled) {
      console.log('🔓 Tokens cleared');
    }
  }

  /**
   * Construit les headers pour les requêtes
   */
  private buildHeaders(body?: any, customHeaders?: HeadersInit): HeadersInit {
    const headers = new Headers(customHeaders);
    
    // Détecter si le premier argument est en fait customHeaders (pour rétrocompatibilité)
    if (body !== undefined && !(body instanceof FormData)) {
      // Vérifier si c'est un Headers ou un objet de headers
      if (body instanceof Headers || 
          (typeof body === 'object' && body !== null && 
           Object.keys(body).some(key => 
             key.toLowerCase().includes('content') || 
             key.toLowerCase().includes('authorization') ||
             key.toLowerCase().includes('accept')))) {
        // C'est probablement customHeaders qu'on a passé comme premier argument
        customHeaders = body;
        body = undefined;
      }
    }
    
    // NE PAS définir Content-Type pour FormData
    if (body !== undefined) {
      const isFormData = body instanceof FormData;
      
      if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    } else {
      // Pas de body (GET, DELETE) ou body undefined
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    if (this.logEnabled) {
      console.log('📝 Request Headers:', Object.fromEntries(headers.entries()));
    }

    return headers;
  }

  /**
   * Gère les erreurs HTTP - LOG TOUTE LA RÉPONSE
   */
  private async handleResponse<T>(method: string, endpoint: string, response: Response, startTime: number): Promise<T> {
    const duration = Date.now() - startTime;

    try {
      const contentType = response.headers.get("content-type");
      let data: any;

      if (response.status === 204) {
        data = {};
      } else if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // LOG TOUTE LA RÉPONSE D'ERREUR
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        const error = new ApiError(errorMessage, response.status, data?.code, data);
        
        this.logResponse(method, endpoint, response, data, duration);
        throw error;
      }

      this.logResponse(method, endpoint, response, data, duration);
      return data as T;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Erreur de parsing JSON ou autre
      // On essaye de récupérer le texte brut de la réponse
      let rawText = '';
      try {
        rawText = await response.text();
      } catch {
        // Ignorer si on ne peut pas lire le texte
      }
      
      const apiError = new ApiError(
        `HTTP ${response.status}: Failed to parse response`,
        response.status,
        undefined,
        rawText || 'Impossible de lire la réponse'
      );
      this.logResponse(method, endpoint, response, rawText || 'Pas de réponse', duration);
      throw apiError;
    }
  }

  /**
   * Requête GET
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    customHeaders?: HeadersInit
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const startTime = Date.now();
    this.logRequest('GET', endpoint, params);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.buildHeaders(undefined, customHeaders),
      });

      return await this.handleResponse<T>('GET', endpoint, response, startTime);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const apiError = new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        { networkError: true, originalError: error }
      );
      this.logResponse('GET', endpoint, apiError, { networkError: true, originalError: error }, Date.now() - startTime);
      throw apiError;
    }
  }

  /**
   * Requête POST
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    customHeaders?: HeadersInit
  ): Promise<T> {
    const startTime = Date.now();
    const isFormData = body instanceof FormData;
    
    this.logRequest('POST', endpoint, isFormData ? '[FormData]' : body);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.buildHeaders(body, customHeaders),
        body: isFormData ? body : JSON.stringify(body),
      });

      return await this.handleResponse<T>('POST', endpoint, response, startTime);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const apiError = new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        { networkError: true, originalError: error }
      );
      this.logResponse('POST', endpoint, apiError, { networkError: true, originalError: error }, Date.now() - startTime);
      throw apiError;
    }
  }

  /**
   * Requête PUT
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    customHeaders?: HeadersInit
  ): Promise<T> {
    const startTime = Date.now();
    const isFormData = body instanceof FormData;
    
    this.logRequest('PUT', endpoint, isFormData ? '[FormData]' : body);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.buildHeaders(body, customHeaders),
        body: isFormData ? body : JSON.stringify(body),
      });

      return await this.handleResponse<T>('PUT', endpoint, response, startTime);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const apiError = new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        { networkError: true, originalError: error }
      );
      this.logResponse('PUT', endpoint, apiError, { networkError: true, originalError: error }, Date.now() - startTime);
      throw apiError;
    }
  }

  /**
   * Requête PATCH
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    customHeaders?: HeadersInit
  ): Promise<T> {
    const startTime = Date.now();
    const isFormData = body instanceof FormData;
    
    this.logRequest('PATCH', endpoint, isFormData ? '[FormData]' : body);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: this.buildHeaders(body, customHeaders),
        body: isFormData ? body : JSON.stringify(body),
      });

      return await this.handleResponse<T>('PATCH', endpoint, response, startTime);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const apiError = new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        { networkError: true, originalError: error }
      );
      this.logResponse('PATCH', endpoint, apiError, { networkError: true, originalError: error }, Date.now() - startTime);
      throw apiError;
    }
  }

  /**
   * Requête DELETE
   */
  async delete<T = unknown>(
    endpoint: string,
    customHeaders?: HeadersInit
  ): Promise<T> {
    const startTime = Date.now();
    this.logRequest('DELETE', endpoint);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.buildHeaders(undefined, customHeaders),
      });

      return await this.handleResponse<T>('DELETE', endpoint, response, startTime);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const apiError = new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        { networkError: true, originalError: error }
      );
      this.logResponse('DELETE', endpoint, apiError, { networkError: true, originalError: error }, Date.now() - startTime);
      throw apiError;
    }
  }
}

// Instance singleton exportée
export const apiClient = new ApiClient();