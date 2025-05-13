"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

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
  const supabase = createClientComponentClient<Database>();

  // Convert Supabase user to our User type
  const mapSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('[AuthContext] mapSupabaseUser called for user ID:', supabaseUser?.id);
    if (!supabaseUser?.id) {
      console.error('[AuthContext] mapSupabaseUser: supabaseUser or supabaseUser.id is null/undefined.');
      return {
        id: 'unknown',
        email: supabaseUser?.email || 'unknown',
        firstName: '',
        lastName: '',
        createdAt: new Date().toISOString(),
      };
    }

    // Fetch additional user data from our users table
    // Use .maybeSingle() to avoid error if user profile doesn't exist yet
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      // This will catch actual database errors, not 'no rows found'
      console.error('[AuthContext] Error fetching user data from \'users\' table. SupabaseUser ID:', supabaseUser.id);
      console.error('[AuthContext] Error object:', error);
      console.error('[AuthContext] Stringified error object:', JSON.stringify(error));
      console.log('[AuthContext] Data object alongside error:', data); // Data might be null here too
      // Return a basic user object if we can't fetch additional data due to an actual error
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: '',
        lastName: '',
        phoneNumber: '', // Ensure all User fields are present
        createdAt: supabaseUser.created_at || new Date().toISOString(),
      };
    }

    if (!data) {
      // This case is now explicitly for when .maybeSingle() returns no data (profile missing)
      console.warn('[AuthContext] No profile data found in \'users\' table for user ID:', supabaseUser.id, '. Returning basic user object.');
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: '', // Default to empty strings as profile is missing
        lastName: '',  // Default to empty strings as profile is missing
        phoneNumber: '', // Ensure all User fields are present
        createdAt: supabaseUser.created_at || new Date().toISOString(),
      };
    }

    // Return user with additional profile data
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      phoneNumber: data.phone_number,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
    };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const mappedUser = await mapSupabaseUser(data.user);
        setUser(mappedUser);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      setLoading(true);
      
      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create the user profile in our users table
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
          },
        ]);

        if (profileError) throw profileError;

        // Create the user object
        const newUser: User = {
          id: authData.user.id,
          email,
          firstName,
          lastName,
          createdAt: authData.user.created_at || new Date().toISOString(),
        };

        setUser(newUser);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session on mount and set up auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const mappedUser = await mapSupabaseUser(session.user);
          setUser(mappedUser);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              const mappedUser = await mapSupabaseUser(session.user);
              setUser(mappedUser);
            } else {
              setUser(null);
            }
          }
        );
        
        // Clean up the subscription when the component unmounts
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
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
