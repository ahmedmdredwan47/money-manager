import { Database } from "./database";

/**
 * Generic Helper Utilities for extracting Supabase Table Types
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ==========================================
// Domain Entity Row Types (Read)
// ==========================================
export type Profile = Tables<"profiles">;
export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;
export type Budget = Tables<"budgets">;
export type SavingsGoal = Tables<"savings_goals">;
export type RecurringTransaction = Tables<"recurring_transactions">;

// ==========================================
// Domain Entity Insert Types (Create)
// ==========================================
export type ProfileInsert = TablesInsert<"profiles">;
export type AccountInsert = TablesInsert<"accounts">;
export type CategoryInsert = TablesInsert<"categories">;
export type TransactionInsert = TablesInsert<"transactions">;
export type BudgetInsert = TablesInsert<"budgets">;
export type SavingsGoalInsert = TablesInsert<"savings_goals">;
export type RecurringTransactionInsert = TablesInsert<"recurring_transactions">;

// ==========================================
// Domain Entity Update Types (Modify)
// ==========================================
export type ProfileUpdate = TablesUpdate<"profiles">;
export type AccountUpdate = TablesUpdate<"accounts">;
export type CategoryUpdate = TablesUpdate<"categories">;
export type TransactionUpdate = TablesUpdate<"transactions">;
export type BudgetUpdate = TablesUpdate<"budgets">;
export type SavingsGoalUpdate = TablesUpdate<"savings_goals">;
export type RecurringTransactionUpdate = TablesUpdate<"recurring_transactions">;

// ==========================================
// Schema-derived Discriminated Unions & Enums
// ==========================================
export type AccountType = Account["type"];
export type CategoryType = Category["type"];
export type TransactionType = Transaction["type"];
export type TransactionStatus = Transaction["status"];
export type BudgetPeriod = Budget["period"];
export type RecurringFrequency = RecurringTransaction["frequency"];

// ==========================================
// Extended / Relational View DTOs
// ==========================================
export interface TransactionWithCategoryAndAccount extends Transaction {
  category?: Category | null;
  account?: Account | null;
  transfer_account?: Account | null;
}

export interface BudgetWithCategory extends Budget {
  category?: Category | null;
  spent_amount?: number;
  remaining_amount?: number;
  percentage_used?: number;
}

export interface SavingsGoalWithProgress extends SavingsGoal {
  percentage_achieved?: number;
  remaining_amount?: number;
}

export interface AccountWithBalances extends Account {
  native_balance: number;
  currency_code: string;
  bdt_equivalent: number | null;
}

