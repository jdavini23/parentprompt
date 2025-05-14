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
    // Set a timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('[AuthContext] Loading timeout reached, forcing loading state to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log('[AuthContext] Initializing auth...');
        
        // Wrap the session retrieval in a try/catch to prevent it from breaking the UI
        try {
          // Get the current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('[AuthContext] Session error:', sessionError);
            // Handle refresh token errors by clearing the session
            if (sessionError.message?.includes('Refresh Token') || 
                sessionError.message?.includes('Invalid Refresh Token')) {
              console.warn('[AuthContext] Refresh token error detected, signing out');
              try {
                await supabase.auth.signOut();
              } catch (signOutError) {
                console.error('[AuthContext] Error during sign out:', signOutError);
              } finally {
                // Always set user to null regardless of errors
                setUser(null);
              }
            }
          } else if (session?.user) {
            try {
              const mappedUser = await mapSupabaseUser(session.user);
              setUser(mappedUser);
            } catch (mapError) {
              console.error('[AuthContext] Error mapping user:', mapError);
              // If mapping fails, still set a basic user object
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: '',
                lastName: '',
                createdAt: session.user.created_at || new Date().toISOString(),
              });
            }
          }
        } catch (sessionError) {
          console.error('[AuthContext] Critical error getting session:', sessionError);
          // Don't let session errors break the app
          setUser(null);
        }
        
        // Set up auth state change listener with error handling
        let subscription: { unsubscribe: () => void } | undefined;
        try {
          const { data } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('[AuthContext] Auth state change event:', event);
              
              try {
                if (event === 'TOKEN_REFRESHED') {
                  console.log('[AuthContext] Token refreshed successfully');
                }
                
                if (event === 'SIGNED_OUT') {
                  console.log('[AuthContext] User signed out');
                  setUser(null);
                  return;
                }
                
                if (session?.user) {
                  try {
                    const mappedUser = await mapSupabaseUser(session.user);
                    setUser(mappedUser);
                  } catch (mapError) {
                    console.error('[AuthContext] Error mapping user during state change:', mapError);
                    // If mapping fails, still set a basic user object
                    setUser({
                      id: session.user.id,
                      email: session.user.email || '',
                      firstName: '',
                      lastName: '',
                      createdAt: session.user.created_at || new Date().toISOString(),
                    });
                  }
                } else {
                  setUser(null);
                }
              } catch (eventError) {
                console.error('[AuthContext] Error handling auth state change:', eventError);
                // Don't let event handling errors break the app
              }
            }
          );
          
          subscription = data.subscription;
        } catch (subscriptionError) {
          console.error('[AuthContext] Error setting up auth state listener:', subscriptionError);
          // If we can't set up the listener, we'll continue without it
        }
        
        // Clean up the subscription when the component unmounts
        return () => {
          if (subscription) {
            try {
              subscription.unsubscribe();
            } catch (unsubError) {
              console.error('[AuthContext] Error unsubscribing:', unsubError);
            }
          }
        };
      } catch (error) {
        console.error('[AuthContext] Critical error in auth initialization:', error);
        // Just set user to null but don't redirect - let middleware handle this
        setUser(null);
      } finally {
        setLoading(false);
        console.log('[AuthContext] Auth initialization complete');
      }
    };
    
    initializeAuth();
    
    // Clean up the timeout when the component unmounts
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []); // Remove loading from dependencies to prevent infinite loop

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
