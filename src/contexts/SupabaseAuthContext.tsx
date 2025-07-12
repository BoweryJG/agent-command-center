import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import supabaseAuthService from '../services/supabase-auth.service';
import { 
  AuthContextType, 
  AuthState, 
  User, 
  LoginCredentials, 
  SignupCredentials 
} from '../types/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const updateUser = useCallback((user: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...user } : null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const currentSession = await supabaseAuthService.getCurrentSession();
      const currentUser = await supabaseAuthService.getCurrentUser();
      
      setSession(currentSession);
      setState({
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...initialState,
        isLoading: false,
        error: 'Failed to fetch user data',
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = supabaseAuthService.onAuthStateChange((user) => {
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }));
    });

    return unsubscribe;
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, session } = await supabaseAuthService.login(credentials);
      setSession(session);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate('/dashboard');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await supabaseAuthService.loginWithGoogle();
      // The auth state change handler will update the state
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      }));
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, session } = await supabaseAuthService.signup(credentials);
      setSession(session);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate('/dashboard');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await supabaseAuthService.logout();
      setSession(null);
      setState({
        ...initialState,
        isLoading: false,
      });
      navigate('/login');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  const resetPassword = async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await supabaseAuthService.resetPassword(email);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await supabaseAuthService.updatePassword(newPassword);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password update failed',
      }));
      throw error;
    }
  };

  const refreshTokens = async () => {
    // Supabase handles token refresh automatically
    await checkAuth();
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    refreshTokens,
    updateUser,
    clearError,
    checkAuth,
    loginWithGoogle,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};