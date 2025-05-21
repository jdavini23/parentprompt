import { createClient } from '@supabase/supabase-js';
import type { Database as SupabaseDatabase } from '@/types/supabase';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''; // Service key is not used here anymore

// Validate required environment variables
if (typeof window !== 'undefined') {
  // Only log in browser environment
  // Log the environment variables for debugging (redacting the keys)
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey ? '[REDACTED]' : 'Not set');
  // console.log('Supabase Service Role Key:', supabaseServiceKey ? '[SET]' : 'Not set'); // Service key is not used here anymore

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('Invalid or missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

// Add a flag to check if we're using real credentials
export const isUsingRealCredentials = Boolean(
  supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey
);

// Update the Database type to match the actual schema
// This type export is important and will be kept.
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_number?: string; // Made optional to match actual schema
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birthdate: string;
          interests: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          birthdate?: string;
          interests?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          birthdate?: string;
          interests?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          content: string;
          type: string;
          age_range: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          type: string;
          age_range: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          type?: string;
          age_range?: string;
          tags?: string[];
          created_at?: string;
        };
      };
      user_prompts: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          completed: boolean;
          favorited: boolean;
          scheduled_for: string;
          delivered_at: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          completed?: boolean;
          favorited?: boolean;
          scheduled_for?: string;
          delivered_at?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          completed?: boolean;
          favorited?: boolean;
          scheduled_for?: string;
          delivered_at?: string;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
