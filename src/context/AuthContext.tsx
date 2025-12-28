import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { USE_MOCK_DATA, MOCK_ADMIN_CREDENTIALS } from '@/lib/mockData';
import { api } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = USE_MOCK_DATA ? MOCK_ADMIN_CREDENTIALS.username : 'admin';
const ADMIN_PASSWORD = USE_MOCK_DATA ? MOCK_ADMIN_CREDENTIALS.password : 'admin123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('admin_auth', 'true');
        } catch {}
        return true;
      }
      return false;
    }

    try {
      const result = await api.adminLogin(username, password);
      if (result.success) {
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('admin_auth', 'true');
        } catch {}
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('admin_auth');
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
