import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, fetchCurrentUser, loginUser, registerUser, logoutUser } from '../api/auth.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    setUser(res.user);
    toast.success(`Welcome back, ${res.user.name}!`);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerUser({ name, email, password });
    setUser(res.user);
    toast.success('Your InterviewLab account has been created!');
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      toast.info('You have been signed out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
