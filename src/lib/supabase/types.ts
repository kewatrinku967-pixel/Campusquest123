export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = 'team_leader' | 'admin';
export type TeamStatus = 'pending_payment' | 'payment_submitted' | 'verified' | 'rejected' | 'completed';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';
export type SessionStatus = 'not_started' | 'active' | 'completed' | 'expired';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: AppRole;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          team_code: string;
          team_name: string;
          leader_user_id: string;
          college: string;
          academic_year: string | null;
          member_count: number;
          status: TeamStatus;
          registered_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_code: string;
          team_name: string;
          leader_user_id: string;
          college: string;
          academic_year?: string | null;
          member_count: number;
          status?: TeamStatus;
          registered_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_code?: string;
          team_name?: string;
          leader_user_id?: string;
          college?: string;
          academic_year?: string | null;
          member_count?: number;
          status?: TeamStatus;
          registered_at?: string;
          created_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          is_leader: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          is_leader?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          is_leader?: boolean;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          team_id: string;
          amount_paise: number;
          upi_reference: string;
          screenshot_path: string | null;
          status: PaymentStatus;
          submitted_at: string;
          verified_at: string | null;
          verified_by: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          amount_paise: number;
          upi_reference: string;
          screenshot_path?: string | null;
          status?: PaymentStatus;
          submitted_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          amount_paise?: number;
          upi_reference?: string;
          screenshot_path?: string | null;
          status?: PaymentStatus;
          submitted_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
      };
      puzzle_stages: {
        Row: {
          id: number;
          title: string;
          description: string;
          puzzle_content: Json;
          points: number;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id: number;
          title: string;
          description: string;
          puzzle_content: Json;
          points: number;
          sort_order: number;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          puzzle_content?: Json;
          points?: number;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      puzzle_answers: {
        Row: {
          stage_id: number;
          accepted_answers: string[];
        };
        Insert: {
          stage_id: number;
          accepted_answers: string[];
        };
        Update: {
          stage_id?: number;
          accepted_answers?: string[];
        };
      };
      game_sessions: {
        Row: {
          id: string;
          team_id: string;
          status: SessionStatus;
          started_by: string | null;
          started_at: string | null;
          expires_at: string | null;
          completed_at: string | null;
          current_stage: number;
          score: number;
          penalty_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          status?: SessionStatus;
          started_by?: string | null;
          started_at?: string | null;
          expires_at?: string | null;
          completed_at?: string | null;
          current_stage?: number;
          score?: number;
          penalty_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          status?: SessionStatus;
          started_by?: string | null;
          started_at?: string | null;
          expires_at?: string | null;
          completed_at?: string | null;
          current_stage?: number;
          score?: number;
          penalty_seconds?: number;
          created_at?: string;
        };
      };
      puzzle_attempts: {
        Row: {
          id: string;
          session_id: string;
          stage_id: number;
          submitted_answer: string;
          is_correct: boolean;
          points_awarded: number;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          stage_id: number;
          submitted_answer: string;
          is_correct: boolean;
          points_awarded?: number;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          stage_id?: number;
          submitted_answer?: string;
          is_correct?: boolean;
          points_awarded?: number;
          attempted_at?: string;
        };
      };
      hint_usage: {
        Row: {
          id: string;
          session_id: string;
          stage_id: number;
          penalty_seconds: number;
          used_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          stage_id: number;
          penalty_seconds?: number;
          used_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          stage_id?: number;
          penalty_seconds?: number;
          used_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          description: string;
          category: string;
          amount_paise: number;
          paid_by: string | null;
          expense_date: string;
          receipt_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          category: string;
          amount_paise: number;
          paid_by?: string | null;
          expense_date?: string;
          receipt_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          category?: string;
          amount_paise?: number;
          paid_by?: string | null;
          expense_date?: string;
          receipt_path?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
  };
}
