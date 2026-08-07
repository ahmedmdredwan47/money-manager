import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category, CategoryInsert, CategoryUpdate } from "@/types";
import { CategoryFormInput } from "../schemas/category-schema";

const DEFAULT_USER_CATEGORIES = [
  // Expenses
  { name: "Housing & Rent", type: "expense", icon: "Home", color: "#3b82f6" },
  { name: "Groceries & Food", type: "expense", icon: "Utensils", color: "#10b981" },
  { name: "Transportation & Fuel", type: "expense", icon: "Car", color: "#f59e0b" },
  { name: "Shopping & Apparel", type: "expense", icon: "ShoppingBag", color: "#ec4899" },
  { name: "Utilities & Bills", type: "expense", icon: "Zap", color: "#ef4444" },
  { name: "Healthcare & Medicine", type: "expense", icon: "HeartPulse", color: "#06b6d4" },
  { name: "Entertainment & Leisure", type: "expense", icon: "Film", color: "#8b5cf6" },

  // Income
  { name: "Salary & Payroll", type: "income", icon: "Briefcase", color: "#10b981" },
  { name: "Freelance & Consulting", type: "income", icon: "DollarSign", color: "#3b82f6" },
  { name: "Investments & Dividends", type: "income", icon: "Landmark", color: "#06b6d4" },

  // Transfer
  { name: "Account Transfer", type: "transfer", icon: "ArrowLeftRight", color: "#64748b" },
];

export function useCategories() {
  const supabase = createClient();

  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      // Query categories belonging to user or system defaults
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_system.eq.true`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching categories:", error.message);
        throw new Error(error.message);
      }

      let categoriesList = (data as Category[]) || [];

      // Requirement 7: Provide default categories if user currently has no categories
      const hasUserCategories = categoriesList.some((c) => c.user_id === user.id);
      if (!hasUserCategories) {
        try {
          const defaultInserts = DEFAULT_USER_CATEGORIES.map((cat) => ({
            user_id: user.id,
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            color: cat.color,
            is_system: false,
          }));

          const { data: seededData } = await (supabase as any)
            .from("categories")
            .insert(defaultInserts)
            .select();

          if (seededData && seededData.length > 0) {
            categoriesList = [...(seededData as Category[]), ...categoriesList];
          }
        } catch (seedErr) {
          console.warn("Could not seed default user categories:", seedErr);
        }
      }

      return categoriesList;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: CategoryFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to create a category.");
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

      const newCategoryPayload: CategoryInsert = {
        user_id: user.id,
        name: input.name,
        type: input.type,
        icon: input.icon || "Tag",
        color: input.color || "#3b82f6",
        is_system: false,
      };

      const { data, error } = await (supabase as any)
        .from("categories")
        .insert(newCategoryPayload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CategoryFormInput }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to update a category.");
      }

      const updatePayload: CategoryUpdate = {
        name: input.name,
        type: input.type,
        icon: input.icon,
        color: input.color,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("categories")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to delete a category.");
      }

      const { error } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
