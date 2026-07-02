// src/api/client.ts
// Centralized API client for the FastAPI backend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function apiClient(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && options?.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  // Future: Add JWT or other auth headers here if required
  // const token = localStorage.getItem('auth_token');
  // if (token) {
  //   headers.set('Authorization', `Bearer ${token}`);
  // }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Don't throw on 404 (caller checks res.ok) or 422 (structured error body — caller reads detail)
  if (!res.ok && res.status !== 404 && res.status !== 422) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res;
}

// Utility methods for common HTTP verbs
export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiClient(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, body?: any, options?: RequestInit) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined 
    }),

  put: (endpoint: string, body?: any, options?: RequestInit) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined 
    }),

  delete: (endpoint: string, options?: RequestInit) => 
    apiClient(endpoint, { ...options, method: 'DELETE' }),
};
