export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
          birthdate: string
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
          age_range: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          type: string
          age_range?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          type?: string
          age_range?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_prompts: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          completed: boolean
          favorited: boolean
          scheduled_for: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          completed?: boolean
          favorited?: boolean
          scheduled_for?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          completed?: boolean
          favorited?: boolean
          scheduled_for?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_time: string
          notification_method: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_time: string
          notification_method: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_time?: string
          notification_method?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
