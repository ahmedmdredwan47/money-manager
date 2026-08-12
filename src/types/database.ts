export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "bank" | "cash" | "card" | "bkash" | "nagad" | "rocket" | "checking" | "savings" | "credit_card" | "investment" | "loan" | "other";
          balance: number;
          currency: string;
          account_number_last4: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "bank" | "cash" | "card" | "bkash" | "nagad" | "rocket" | "checking" | "savings" | "credit_card" | "investment" | "loan" | "other";
          balance?: number;
          currency?: string;
          account_number_last4?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          type: "income" | "expense" | "transfer";
          icon: string | null;
          color: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type: "income" | "expense" | "transfer";
          icon?: string | null;
          color?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          transfer_account_id: string | null;
          type: "income" | "expense" | "transfer";
          amount: number;
          currency: string;
          exchange_rate: number | null;
          bdt_amount: number | null;
          date: string;
          payee_merchant: string | null;
          description: string | null;
          status: "pending" | "cleared" | "reconciled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          transfer_account_id?: string | null;
          type: "income" | "expense" | "transfer";
          amount: number;
          currency?: string;
          exchange_rate?: number | null;
          bdt_amount?: number | null;
          date?: string;
          payee_merchant?: string | null;
          description?: string | null;
          status?: "pending" | "cleared" | "reconciled";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount_limit: number;
          period: "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount_limit: number;
          period?: "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Insert"]>;
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          title: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          color: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id?: string | null;
          title: string;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          color?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["savings_goals"]["Insert"]>;
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          type: "income" | "expense" | "transfer";
          amount: number;
          payee_merchant: string | null;
          description: string | null;
          frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          last_processed_date: string | null;
          next_due_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          type: "income" | "expense" | "transfer";
          amount: number;
          payee_merchant?: string | null;
          description?: string | null;
          frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          last_processed_date?: string | null;
          next_due_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recurring_transactions"]["Insert"]>;
      };
    };
  };
}
