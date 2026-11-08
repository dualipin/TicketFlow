import React, { createContext, useContext, useState } from 'react';
import type { AuthUser } from '../api/types.ts';

interface AuthContextValue {
  currentUser: AuthUser | null;
  isLocked: boolean;
  login: (user: AuthUser) => void;
  lock: () => void;
  logout: () => void;
  setIsLocked: (locked: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'ticketflow_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // Si no hay usuario guardado previamente, la aplicación arranca bloqueada
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return !saved;
    } catch {
      return true;
    }
  });

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLocked(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
  };

  const lock = () => {
    setIsLocked(true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLocked(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLocked,
        login,
        lock,
        logout,
        setIsLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
