import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import * as authService from '@/services/authService';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  updateCurrentUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshUser = async () => {
    console.log('[UserContext] refreshUser called');
    const token = authService.getToken();
    console.log('[UserContext] Token exists:', !!token);
    
    if (!token) {
      console.log('[UserContext] No token found, setting unauthenticated');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      console.log('[UserContext] Calling /me endpoint...');
      const user = await authService.getCurrentUser();
      console.log('[UserContext] /me successful, user:', user.name, 'type:', user.user_type);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('[UserContext] Error fetching current user:', error);
      console.error('[UserContext] Error status:', error.response?.status);
      console.error('[UserContext] Error data:', error.response?.data);
      
      // Only clear auth if it's actually an authentication error (401)
      if (error.response?.status === 401) {
        console.log('[UserContext] 401 error, clearing auth state');
        authService.removeToken();
        setCurrentUser(null);
        setIsAuthenticated(false);
      } else {
        // For other errors (500, network errors, etc.), keep the user logged in
        console.log('[UserContext] Non-401 error, keeping current state');
        // Don't change authentication state on network/server errors
      }
    } finally {
      setLoading(false);
      console.log('[UserContext] refreshUser completed');
    }
  };

  const login = async (email: string, password: string) => {
    const user = await authService.login({ email, password });
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      loading, 
      isAuthenticated,
      updateCurrentUser, 
      refreshUser,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
