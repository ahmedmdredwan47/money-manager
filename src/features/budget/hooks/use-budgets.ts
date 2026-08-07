import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Budget, BudgetInsert, BudgetUpdate, Category } from "@/types";
import { BudgetFormInput } from "../schemas/budget-schema";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCategories } from "@/features/categories/hooks/use-categories";

export interface BudgetWithCalculations extends Budget {
  category?: Category | null;
  actual_spent: number;
  remaining_balance: number;
  percentage_used: number;
  is_warning: boolean;
  is_exceeded: boolean;
}

const SAMPLE_BUDGETS: Budget[] = [
  {
    id: "bgt-1",
    user_id: "demo-user",
    category_id: "sys-2", // Groceries
    amount_limit: 15000.00,
    period: "monthly",
    start_date: "2026-08-01",
    end_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "bgt-2",
    user_id: "demo-user",
    category_id: "sys-1", // Housing & Rent
    amount_limit: 25000.00,
    period: "monthly",
    start_date: "2026-08-01",
    end_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "bgt-3",
    user_id: "demo-user",
    category_id: "sys-3", // Transportation
    amount_limit: 5000.00,
    period: "monthly",
    start_date: "2026-08-01",
    end_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "bgt-4",
    user_id: "demo-user",
    category_id: "sys-7", // Utilities & Bills
    amount_limit: 4000.00,
    period: "monthly",
    start_date: "2026-08-01",
    end_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let localMemoryBudgets: Budget[] = [...SAMPLE_BUDGETS];

export function useBudgets(selectedMonthStr?: string) {
  const supabase = createClient();
  const targetMonth = selectedMonthStr || new Date().toISOString().slice(0, 7); // e.g. "2026-08"

  const { data: txResult } = useTransactions({ pageSize: 200 });
  const { data: categories } = useCategories();

  const allTransactions = txResult?.data || [];
  const allCategories = categories || [];

  return useQuery<BudgetWithCalculations[]>({
    queryKey: ["budgets", targetMonth, allTransactions.length],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let rawBudgets: Budget[] = localMemoryBudgets;

      if (user) {
        const { data, error } = await (supabase as any)
          .from("budgets")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          rawBudgets = data as Budget[];
        }
      }

      // Aggregate expense transactions for target month
      const categorySpentMap: Record<string, number> = {};
      allTransactions
        .filter((t) => {
          if (t.type !== "expense" || !t.category_id) return false;
          return t.date.startsWith(targetMonth);
        })
        .forEach((t) => {
          categorySpentMap[t.category_id!] = (categorySpentMap[t.category_id!] || 0) + t.amount;
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

      const newBudgetPayload: BudgetInsert = {
        user_id: user?.id || "demo-user",
        category_id: input.category_id,
        amount_limit: input.amount_limit,
        period: input.period || "monthly",
        start_date: `${input.month}-01`,
        end_date: null,
      };

      const createdLocal: Budget = {
        id: `bgt-${Date.now()}`,
        ...newBudgetPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Budget;

      if (!user) {
        localMemoryBudgets = [createdLocal, ...localMemoryBudgets];
        return createdLocal;
      }

      // Ensure profile row exists in public.profiles to satisfy user_id foreign key constraint
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
        console.warn("Could not upsert profile record prior to budget creation:", profileErr);
      }

      let data: any = null;
      let error: any = null;

      try {
        const res = await (supabase as any)
          .from("budgets")
          .insert(newBudgetPayload)
          .select()
          .single();
        data = res.data;
        error = res.error;
      } catch (err) {
        error = err;
      }

      if (error || !data) {
        console.warn("Supabase budget insert warning, using local memory fallback:", error?.message);
        localMemoryBudgets = [createdLocal, ...localMemoryBudgets];
        return createdLocal;
      }

      const createdBudget = data as Budget;
      localMemoryBudgets = [createdBudget, ...localMemoryBudgets.filter((b) => b.id !== createdBudget.id)];
      return createdBudget;
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

      const updatePayload: BudgetUpdate = {
        category_id: input.category_id,
        amount_limit: input.amount_limit,
        period: input.period,
        start_date: `${input.month}-01`,
        updated_at: new Date().toISOString(),
      };

      if (!user || id.startsWith("bgt-")) {
        localMemoryBudgets = localMemoryBudgets.map((b) =>
          b.id === id ? ({ ...b, ...updatePayload } as Budget) : b
        );
        return localMemoryBudgets.find((b) => b.id === id);
      }

      const { data, error } = await (supabase as any)
        .from("budgets")
        .update(updatePayload)
        .eq("id", id)
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

      if (!user || id.startsWith("bgt-")) {
        localMemoryBudgets = localMemoryBudgets.filter((b) => b.id !== id);
        return id;
      }

      const { error } = await (supabase as any).from("budgets").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
