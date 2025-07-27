import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string;
          name: string;
          role: 'student' | 'employer';
          aadhaar_masked: string | null;
          verification_status: 'pending' | 'verified' | 'rejected';
          rating: number;
          total_ratings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone: string;
          name: string;
          role: 'student' | 'employer';
          aadhaar_masked?: string | null;
          verification_status?: 'pending' | 'verified' | 'rejected';
          rating?: number;
          total_ratings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string;
          name?: string;
          role?: 'student' | 'employer';
          aadhaar_masked?: string | null;
          verification_status?: 'pending' | 'verified' | 'rejected';
          rating?: number;
          total_ratings?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          poster_id: string;
          title: string;
          domain: string;
          description: string;
          skills_required: string | null;
          gender_preference: string | null;
          age_preference: string | null;
          pay_offered: number;
          is_negotiable: boolean;
          location_address: string;
          latitude: number | null;
          longitude: number | null;
          start_time: string;
          end_time: string;
          optional_instructions: string | null;
          status: 'active' | 'filled' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          poster_id: string;
          title: string;
          domain: string;
          description: string;
          skills_required?: string | null;
          gender_preference?: string | null;
          age_preference?: string | null;
          pay_offered: number;
          is_negotiable?: boolean;
          location_address: string;
          latitude?: number | null;
          longitude?: number | null;
          start_time: string;
          end_time: string;
          optional_instructions?: string | null;
          status?: 'active' | 'filled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          poster_id?: string;
          title?: string;
          domain?: string;
          description?: string;
          skills_required?: string | null;
          gender_preference?: string | null;
          age_preference?: string | null;
          pay_offered?: number;
          is_negotiable?: boolean;
          location_address?: string;
          latitude?: number | null;
          longitude?: number | null;
          start_time?: string;
          end_time?: string;
          optional_instructions?: string | null;
          status?: 'active' | 'filled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          student_id: string;
          status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
          original_pay: number | null;
          negotiated_pay: number | null;
          final_pay: number | null;
          distance_km: number | null;
          time_to_reach_min: number | null;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          student_id: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'negotiating';
          original_pay?: number | null;
          negotiated_pay?: number | null;
          final_pay?: number | null;
          distance_km?: number | null;
          time_to_reach_min?: number | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          student_id?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'negotiating';
          original_pay?: number | null;
          negotiated_pay?: number | null;
          final_pay?: number | null;
          distance_km?: number | null;
          time_to_reach_min?: number | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallet_entries: {
        Row: {
          id: string;
          student_id: string;
          job_id: string;
          amount: number;
          duration_hours: number | null;
          status: 'pending' | 'paid';
          payment_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          job_id: string;
          amount: number;
          duration_hours?: number | null;
          status?: 'pending' | 'paid';
          payment_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          job_id?: string;
          amount?: number;
          duration_hours?: number | null;
          status?: 'pending' | 'paid';
          payment_date?: string | null;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          job_id: string;
          stars: number;
          tags: string[] | null;
          feedback: string | null;
          is_anonymous: boolean;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          job_id: string;
          stars: number;
          tags?: string[] | null;
          feedback?: string | null;
          is_anonymous?: boolean;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          job_id?: string;
          stars?: number;
          tags?: string[] | null;
          feedback?: string | null;
          is_anonymous?: boolean;
          is_public?: boolean;
          created_at?: string;
        };
      };
    };
  };
};