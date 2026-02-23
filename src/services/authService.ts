/**
 * File: services/authService.ts
 * Purpose: Authentication service for login, register, logout operations.
 */

import api from '@/lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

interface AuthResponse {
  user: any;
  token: string;
}

/** Login user and store token */
export const login = async (credentials: LoginCredentials): Promise<any> => {
  const response = await api.post('/login', credentials);
  const { token, user } = response.data.data;
  localStorage.setItem('auth_token', token);
  return user;
};

/** Register new user and store token */
export const register = async (userData: RegisterData): Promise<any> => {
  try {
    console.log('Registering user with data:', { ...userData, password: '***', password_confirmation: '***' });
    const response = await api.post('/register', userData);
    console.log('Registration response:', response.data);
    const { token, user } = response.data.data;
    localStorage.setItem('auth_token', token);
    return user;
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

/** Logout user and remove token */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth_token');
  }
};

/** Get current authenticated user */
export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await api.get('/me');
    console.log('getCurrentUser response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('getCurrentUser error:', error.response?.data || error.message);
    throw error;
  }
};

/** Get stored auth token */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/** Set auth token */
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/** Remove auth token */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/** Check if user is authenticated */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
