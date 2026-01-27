
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
      members: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          club_id: string | null
          status: string
          tier: string | null
          join_date: string | null
          avatar_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          club_id?: string | null
          status?: string
          tier?: string | null
          join_date?: string | null
          avatar_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          club_id?: string | null
          status?: string
          tier?: string | null
          join_date?: string | null
          avatar_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
