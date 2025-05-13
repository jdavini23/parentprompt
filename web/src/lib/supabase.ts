import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Log the environment variables for debugging (redacting the key)
console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key:", supabaseAnonKey ? "[REDACTED]" : "Not set")

// If URL is not set or invalid, use a placeholder that won't throw URL construction errors
if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  console.warn("Invalid or missing Supabase URL. Using placeholder URL for development.")
  // Use a valid URL format as a placeholder
  supabaseUrl = "https://placeholder-project.supabase.co"
}

// If key is not set, use a placeholder
if (!supabaseAnonKey) {
  console.warn("Missing Supabase Anon Key. Using placeholder key for development.")
  supabaseAnonKey = "placeholder-key"
}

// Create the Supabase client with our values (real or placeholder)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Add a flag to check if we're using real credentials
export const isUsingRealCredentials =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http") &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          name: string
          child_name: string
          child_age: number
          interests: string[]
          preferred_time: string
        }
        Insert: {
          id: string
          created_at?: string
          name: string
          child_name: string
          child_age: number
          interests: string[]
          preferred_time: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          child_name?: string
          child_age?: number
          interests?: string[]
          preferred_time?: string
        }
      }
      prompts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          prompt_text: string
          completed: boolean
          favorite: boolean
          date: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          prompt_text: string
          completed?: boolean
          favorite?: boolean
          date: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          prompt_text?: string
          completed?: boolean
          favorite?: boolean
          date?: string
        }
      }
    }
  }
}
