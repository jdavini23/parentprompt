import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth object available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication functions for demonstration purposes
  // In a real app, these would interact with Supabase or another auth provider
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // This would be replaced with actual authentication logic
      console.log(`Signing in with ${email} and password`);
      
      // Mock successful login
      const mockUser: User = {
        id: '123',
        email,
        firstName: 'Jane',
        lastName: 'Parent',
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      
      // Store auth state in localStorage or cookies
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      setLoading(true);
      // This would be replaced with actual registration logic
      console.log(`Signing up with ${email}, ${firstName} ${lastName}, and password`);
      
      // Mock successful registration
      const mockUser: User = {
        id: '123',
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      
      // Store auth state in localStorage or cookies
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual logout logic
      console.log('Signing out');
      
      setUser(null);
      
      // Remove auth state from localStorage or cookies
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // This would be replaced with actual password reset logic
      console.log(`Resetting password for ${email}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Create the value object that will be provided by the context
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
