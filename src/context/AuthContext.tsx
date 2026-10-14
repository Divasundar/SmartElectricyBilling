// ============================================================
// SMART BILLING — Centralized Authentication Context
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { AuthUser, UserRole } from '../types';

export interface DemoCredential {
  email: string;
  aliases?: string[];
  password: string;
  user: AuthUser;
  defaultPath: string;
  label: string;
}

export const DEMO_ACCOUNTS: DemoCredential[] = [
  {
    email: 'admin@smartbilling.com',
    aliases: ['rajesh.nair@smartbilling.in'],
    password: 'admin123',
    user: {
      id: 'USR-001',
      name: 'Rajesh Nair',
      email: 'admin@smartbilling.com',
      role: 'ADMIN',
    },
    defaultPath: '/admin/dashboard',
    label: 'Admin',
  },
  {
    email: 'clerk@smartbilling.com',
    aliases: ['meera.pillai@smartbilling.in'],
    password: 'clerk123',
    user: {
      id: 'USR-002',
      name: 'Meera Pillai',
      email: 'clerk@smartbilling.com',
      role: 'BILLING_CLERK',
    },
    defaultPath: '/clerk/dashboard',
    label: 'Billing Clerk',
  },
  {
    email: 'rahul@smartbilling.com',
    aliases: ['rahul.kumar@gmail.com'],
    password: 'consumer123',
    user: {
      id: 'CON-001',
      name: 'Rahul Kumar',
      email: 'rahul@smartbilling.com',
      role: 'CONSUMER',
      consumerId: 'C10234',
    },
    defaultPath: '/consumer/dashboard',
    label: 'Consumer',
  },
];

const AUTH_STORAGE_KEY = 'smart_billing_auth_session';

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: AuthUser | null };

const initialAuthState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        currentUser: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
      };
    case 'RESTORE_SESSION':
      return {
        isAuthenticated: !!action.payload,
        currentUser: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

export interface LoginResult {
  success: boolean;
  error?: string;
  role?: UserRole;
  defaultPath?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  demoAccounts: DemoCredential[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        if (parsed && parsed.email && parsed.role) {
          dispatch({ type: 'RESTORE_SESSION', payload: parsed });
          return;
        }
      }
    } catch {
      // Ignore parse errors and reset
    }
    dispatch({ type: 'RESTORE_SESSION', payload: null });
  }, []);

  const login = async (emailInput: string, passwordInput: string): Promise<LoginResult> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Check credentials against demo accounts
    const match = DEMO_ACCOUNTS.find(account => {
      const isEmailMatch =
        account.email.toLowerCase() === cleanEmail ||
        (account.aliases && account.aliases.some(alias => alias.toLowerCase() === cleanEmail));
      const isPasswordMatch = account.password === cleanPassword;
      return isEmailMatch && isPasswordMatch;
    });

    if (match) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(match.user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: match.user });
      return {
        success: true,
        role: match.user.role,
        defaultPath: match.defaultPath,
      };
    }

    return {
      success: false,
      error: 'Invalid email or password.',
    };
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Storage unavailable or cleared
    }
    dispatch({ type: 'LOGOUT' });
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      currentUser: state.currentUser,
      isLoading: state.isLoading,
      login,
      logout,
      demoAccounts: DEMO_ACCOUNTS,
    }),
    [state.isAuthenticated, state.currentUser, state.isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
