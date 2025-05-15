import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ""

// Validate required environment variables
if (typeof window !== 'undefined') { // Only log in browser environment
  // Log the environment variables for debugging (redacting the keys)
  console.log("Supabase URL:", supabaseUrl)
  console.log("Supabase Anon Key:", supabaseAnonKey ? "[REDACTED]" : "Not set")
  console.log("Supabase Service Role Key:", supabaseServiceKey ? "[SET]" : "Not set")
  
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    console.error("Invalid or missing NEXT_PUBLIC_SUPABASE_URL")
  }
  
  if (!supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
}

// Singleton instances
let supabaseInstance: SupabaseClient<Database> | null = null
let supabaseAdminInstance: SupabaseClient<Database> | null = null

// For Next.js, we need to handle both client and server environments differently
const isServer = typeof window === 'undefined'

// Create standard client for regular operations
export const getSupabase = (): SupabaseClient<Database> => {
  if (isServer) {
    // Server-side - create a new instance each time
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  }
  
  // Client-side - use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  }
  return supabaseInstance
}

// Create admin client for operations that need to bypass RLS
export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  // Check for service role key in both formats
  const serviceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!serviceKey) {
    console.error('Service role key is missing. Check environment variables.')
    throw new Error('Service role key is required for admin operations')
  }

  // If we already have an admin instance, return it
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Create a new admin instance
  console.log('Creating new admin client instance...')
  supabaseAdminInstance = createClient<Database>(
    supabaseUrl, 
    serviceKey, // Use the resolved service key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
  
  return supabaseAdminInstance
}

// Helper function to get the appropriate client
export const getSupabaseClient = (useAdmin: boolean = false): SupabaseClient<Database> => {
  try {
    return useAdmin ? getSupabaseAdmin() : getSupabase()
  } catch (error) {
    console.error('Error getting Supabase client:', error)
    throw error
  }
}

// Export the default client instance for backward compatibility
export const supabase = getSupabase()

// Add a flag to check if we're using real credentials
export const isUsingRealCredentials = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith("http") && 
  supabaseAnonKey
)

// Update the Database type to match the actual schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          birthdate: string
          interests: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          birthdate?: string
          interests?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birthdate?: string
          interests?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          content: string
          type: string
          age_range: string
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          type: string
          age_range: string
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          type?: string
          age_range?: string
          tags?: string[]
          created_at?: string
        }
      }
      user_prompts: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          completed: boolean
          favorited: boolean
          scheduled_for: string
          delivered_at: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          completed?: boolean
          favorited?: boolean
          scheduled_for?: string
          delivered_at?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          completed?: boolean
          favorited?: boolean
          scheduled_for?: string
          delivered_at?: string
          notes?: string
          created_at?: string
        }
      }
    }
  }
}
