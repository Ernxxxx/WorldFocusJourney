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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          country_code: string | null
          name: string
          x: number
          y: number
          is_start: boolean
        }
        Insert: {
          id: string
          country_code?: string | null
          name: string
          x: number
          y: number
          is_start?: boolean
        }
        Update: {
          id?: string
          country_code?: string | null
          name?: string
          x?: number
          y?: number
          is_start?: boolean
        }
      }
      paths: {
        Row: {
          id: string
          from_location_id: string
          to_location_id: string
          distance_km: number
        }
        Insert: {
          id?: string
          from_location_id: string
          to_location_id: string
          distance_km: number
        }
        Update: {
          id?: string
          from_location_id?: string
          to_location_id?: string
          distance_km?: number
        }
      }
      user_progress: {
        Row: {
          user_id: string
          current_location_id: string | null
          current_path_id: string | null
          progress_km: number
          updated_at: string
        }
        Insert: {
          user_id: string
          current_location_id?: string | null
          current_path_id?: string | null
          progress_km?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          current_location_id?: string | null
          current_path_id?: string | null
          progress_km?: number
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          start_at: string
          end_at: string | null
          distance_earned_km: number | null
          status: 'SUCCESS' | 'CANCELED' | 'IN_PROGRESS'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_at: string
          end_at?: string | null
          distance_earned_km?: number | null
          status: 'SUCCESS' | 'CANCELED' | 'IN_PROGRESS'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_at?: string
          end_at?: string | null
          distance_earned_km?: number | null
          status?: 'SUCCESS' | 'CANCELED' | 'IN_PROGRESS'
          created_at?: string
        }
      }
    }
  }
}
