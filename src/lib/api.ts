/**
 * File: lib/api.ts
 * Purpose: Axios instance configured for Laravel backend API with authentication
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized - but don't auto-logout on every 401
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Only clear auth and redirect for specific endpoints
      if (url.includes('/logout') || url.includes('/login')) {
        localStorage.removeItem('auth_token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
      // For /me endpoint, let the UserContext handle it
      // For other endpoints, the error will propagate to the caller
    }
    
    return Promise.reject(error);
  }
);

export default api;
