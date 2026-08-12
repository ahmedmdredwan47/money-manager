import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Budget, BudgetInsert, BudgetUpdate, Category, TransactionWithCategoryAndAccount } from "@/types";
import { BudgetFormInput } from "../schemas/budget-schema";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useExchangeRates, getTransactionBdtAmount } from "@/lib/exchange-rates";

export interface BudgetWithCalculations extends Budget {
  category: Category | null;
  actual_spent: number;
  remaining_balance: number;
  percentage_used: number;
  is_warning: boolean;
  is_exceeded: boolean;
}

export function useBudgets(targetMonthStr?: string) {
  const supabase = createClient();
  const { data: categories } = useCategories();
  const { data: txResult } = useTransactions({ pageSize: 500 });
  const { data: ratesData } = useExchangeRates();

  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const targetMonth = targetMonthStr || currentYearMonth;

  return useQuery<BudgetWithCalculations[]>({
    queryKey: ["budgets", targetMonth, categories, txResult],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const allCategories = categories || [];
      const allTransactions = txResult?.data || [];

      const { data, error } = await (supabase as any)
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching budgets:", error.message);
        throw new Error(error.message);
      }

      const rawBudgets = (data as Budget[]) || [];
      const rates = ratesData?.rates ?? { BDT: 1 };

      // Aggregate expense transactions for target month (in BDT)
      const categorySpentMap: Record<string, number> = {};
      allTransactions
        .filter((t) => {
          if (t.type !== "expense" || !t.category_id) return false;
          return t.date.startsWith(targetMonth);
        })
        .forEach((t) => {
          categorySpentMap[t.category_id!] = (categorySpentMap[t.category_id!] || 0) + getTransactionBdtAmount(t, rates);
        });

      return rawBudgets.map((b) => {
        const catObj = allCategories.find((c) => c.id === b.category_id) || null;
        const actual_spent = categorySpentMap[b.category_id] || 0;
        const remaining_balance = b.amount_limit - actual_spent;
        const percentage_used = b.amount_limit > 0 ? (actual_spent / b.amount_limit) * 100 : 0;
        const is_warning = percentage_used >= 80 && percentage_used < 100;
        const is_exceeded = percentage_used >= 100;

        return {
          ...b,
          category: catObj,
          actual_spent,
          remaining_balance,
          percentage_used,
          is_warning,
          is_exceeded,
        };
      });
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: BudgetFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to set a budget.");
      }

      // Ensure profile row exists in public.profiles
      try {
        await (supabase as any).from("profiles").upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.warn("Could not upsert profile record:", profileErr);
      }

      const newBudgetPayload: BudgetInsert = {
        user_id: user.id,
        category_id: input.category_id,
        amount_limit: input.amount_limit,
        period: input.period || "monthly",
        start_date: `${input.month}-01`,
        end_date: null,
      };

      const { data, error } = await (supabase as any)
        .from("budgets")
        .insert(newBudgetPayload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BudgetFormInput }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to update a budget.");
      }

      const updatePayload: BudgetUpdate = {
        category_id: input.category_id,
        amount_limit: input.amount_limit,
        period: input.period || "monthly",
        start_date: `${input.month}-01`,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("budgets")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to delete a budget.");
      }

      const { error } = await (supabase as any)
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
