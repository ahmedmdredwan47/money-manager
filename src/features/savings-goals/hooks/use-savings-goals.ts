import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { SavingsGoal, SavingsGoalInsert, SavingsGoalUpdate, Account } from "@/types";
import { SavingsGoalFormInput } from "../schemas/savings-goal-schema";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";

export interface SavingsGoalWithCalculations extends SavingsGoal {
  account?: Account | null;
  percentage: number;
  remaining_amount: number;
  months_left?: number;
  monthly_pace?: number;
}

export function useSavingsGoals() {
  const supabase = createClient();
  const { data: accounts } = useAccounts();

  return useQuery<SavingsGoalWithCalculations[]>({
    queryKey: ["savings-goals", accounts],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const allAccounts = accounts || [];

      const { data, error } = await (supabase as any)
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching savings goals:", error.message);
        throw new Error(error.message);
      }

      const rawGoals = (data as SavingsGoal[]) || [];

      return rawGoals.map((g) => {
        const accObj = allAccounts.find((a) => a.id === g.account_id) || null;
        const percentage =
          g.target_amount > 0
            ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
            : 0;
        const remaining_amount = Math.max(0, g.target_amount - g.current_amount);

        let months_left = 0;
        let monthly_pace = 0;
        if (g.target_date) {
          const now = new Date();
          const target = new Date(g.target_date);
          const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
          months_left = Math.max(1, diffMonths);
          monthly_pace = remaining_amount > 0 ? remaining_amount / months_left : 0;
        }

        return {
          ...g,
          account: accObj,
          percentage,
          remaining_amount,
          months_left,
          monthly_pace,
        };
      });
    },
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: SavingsGoalFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to create a savings goal.");
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

      const isCompleted = (input.current_amount || 0) >= input.target_amount;

      const newGoalPayload: SavingsGoalInsert = {
        user_id: user.id,
        account_id: input.account_id || null,
        title: input.title,
        target_amount: input.target_amount,
        current_amount: input.current_amount || 0,
        target_date: input.target_date || null,
        color: input.color || "#10b981",
        is_completed: isCompleted,
      };

      const { data, error } = await (supabase as any)
        .from("savings_goals")
        .insert(newGoalPayload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SavingsGoalFormInput }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to update a savings goal.");
      }

      const isCompleted = (input.current_amount || 0) >= input.target_amount;

      const updatePayload: SavingsGoalUpdate = {
        account_id: input.account_id || null,
        title: input.title,
        target_amount: input.target_amount,
        current_amount: input.current_amount || 0,
        target_date: input.target_date || null,
        color: input.color,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("savings_goals")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}

export function useDepositSavingsGoal() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to deposit to a savings goal.");
      }

      // Fetch current goal
      const { data: goalData, error: fetchErr } = await (supabase as any)
        .from("savings_goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchErr || !goalData) throw new Error("Goal not found.");

      const newCurrent = Number(goalData.current_amount || 0) + Number(amount);
      const isCompleted = newCurrent >= Number(goalData.target_amount);

      const { data, error } = await (supabase as any)
        .from("savings_goals")
        .update({
          current_amount: newCurrent,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to delete a savings goal.");
      }

      const { error } = await (supabase as any)
        .from("savings_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}
