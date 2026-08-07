import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { SavingsGoal, SavingsGoalInsert, SavingsGoalUpdate } from "@/types";
import { SavingsGoalFormInput } from "../schemas/savings-goal-schema";

export interface SavingsGoalWithCalculations extends SavingsGoal {
  percentage: number;
  remaining_amount: number;
  months_left: number | null;
  monthly_pace: number | null;
}

const SAMPLE_GOALS: SavingsGoal[] = [
  {
    id: "goal-1",
    user_id: "demo-user",
    account_id: "sample-1",
    title: "Emergency Fund",
    target_amount: 300000.00,
    current_amount: 185000.00,
    target_date: "2026-12-31",
    color: "#10b981",
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "goal-2",
    user_id: "demo-user",
    account_id: "sample-1",
    title: "New Laptop & Workspace",
    target_amount: 150000.00,
    current_amount: 120000.00,
    target_date: "2026-10-15",
    color: "#3b82f6",
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "goal-3",
    user_id: "demo-user",
    account_id: "sample-2",
    title: "Vacation Trip to Cox's Bazar",
    target_amount: 45000.00,
    current_amount: 45000.00,
    target_date: "2026-07-01",
    color: "#ec4899",
    is_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "goal-4",
    user_id: "demo-user",
    account_id: "sample-1",
    title: "Home Renovation",
    target_amount: 500000.00,
    current_amount: 125000.00,
    target_date: "2027-06-30",
    color: "#f59e0b",
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let localMemoryGoals: SavingsGoal[] = [...SAMPLE_GOALS];

export function useSavingsGoals() {
  const supabase = createClient();

  return useQuery<SavingsGoalWithCalculations[]>({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let rawGoals: SavingsGoal[] = localMemoryGoals;

      if (user) {
        const { data, error } = await (supabase as any)
          .from("savings_goals")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          rawGoals = data as SavingsGoal[];
        }
      }

      const now = new Date();

      return rawGoals.map((g) => {
        const percentage = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
        const remaining_amount = Math.max(0, g.target_amount - g.current_amount);

        let months_left: number | null = null;
        let monthly_pace: number | null = null;

        if (g.target_date) {
          const targetDateObj = new Date(g.target_date);
          const diffTime = targetDateObj.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          months_left = Math.max(1, Math.ceil(diffDays / 30));

          if (remaining_amount > 0 && months_left > 0) {
            monthly_pace = remaining_amount / months_left;
          } else {
            monthly_pace = 0;
          }
        }

        const is_completed = g.current_amount >= g.target_amount;

        return {
          ...g,
          is_completed,
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

      const isCompleted = (input.current_amount || 0) >= input.target_amount;

      const newGoalPayload: SavingsGoalInsert = {
        user_id: user?.id || "demo-user",
        account_id: input.account_id || null,
        title: input.title,
        target_amount: input.target_amount,
        current_amount: input.current_amount || 0,
        target_date: input.target_date || null,
        color: input.color || "#10b981",
        is_completed: isCompleted,
      };

      const createdLocal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        ...newGoalPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as SavingsGoal;

      if (!user) {
        localMemoryGoals = [createdLocal, ...localMemoryGoals];
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
        console.warn("Could not upsert profile record prior to savings goal creation:", profileErr);
      }

      let data: any = null;
      let error: any = null;

      try {
        const res = await (supabase as any)
          .from("savings_goals")
          .insert(newGoalPayload)
          .select()
          .single();
        data = res.data;
        error = res.error;
      } catch (err) {
        error = err;
      }

      if (error || !data) {
        console.warn("Supabase savings goal insert warning, using local memory fallback:", error?.message);
        localMemoryGoals = [createdLocal, ...localMemoryGoals];
        return createdLocal;
      }

      const createdGoal = data as SavingsGoal;
      localMemoryGoals = [createdGoal, ...localMemoryGoals.filter((g) => g.id !== createdGoal.id)];
      return createdGoal;
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

      const isCompleted = (input.current_amount || 0) >= input.target_amount;

      const updatePayload: SavingsGoalUpdate = {
        title: input.title,
        target_amount: input.target_amount,
        current_amount: input.current_amount || 0,
        target_date: input.target_date || null,
        account_id: input.account_id || null,
        color: input.color || "#10b981",
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      };

      if (!user || id.startsWith("goal-")) {
        localMemoryGoals = localMemoryGoals.map((g) =>
          g.id === id ? ({ ...g, ...updatePayload } as SavingsGoal) : g
        );
        return localMemoryGoals.find((g) => g.id === id);
      }

      const { data, error } = await (supabase as any)
        .from("savings_goals")
        .update(updatePayload)
        .eq("id", id)
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
    mutationFn: async ({ id, depositAmount }: { id: string; depositAmount: number }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || id.startsWith("goal-")) {
        localMemoryGoals = localMemoryGoals.map((g) => {
          if (g.id === id) {
            const newCurrent = g.current_amount + depositAmount;
            return {
              ...g,
              current_amount: newCurrent,
              is_completed: newCurrent >= g.target_amount,
              updated_at: new Date().toISOString(),
            };
          }
          return g;
        });
        return localMemoryGoals.find((g) => g.id === id);
      }

      // Fetch existing
      const { data: existing } = await (supabase as any)
        .from("savings_goals")
        .select("current_amount, target_amount")
        .eq("id", id)
        .single();

      const newCurrent = ((existing?.current_amount as number) || 0) + depositAmount;
      const isCompleted = newCurrent >= (existing?.target_amount || 0);

      const { data, error } = await (supabase as any)
        .from("savings_goals")
        .update({
          current_amount: newCurrent,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
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

      if (!user || id.startsWith("goal-")) {
        localMemoryGoals = localMemoryGoals.filter((g) => g.id !== id);
        return id;
      }

      const { error } = await (supabase as any).from("savings_goals").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}
