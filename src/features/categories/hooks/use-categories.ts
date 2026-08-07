import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category, CategoryInsert, CategoryUpdate } from "@/types";
import { CategoryFormInput } from "../schemas/category-schema";

const SAMPLE_CATEGORIES: Category[] = [
  // System Default Expense Categories
  { id: "sys-1", user_id: null, name: "Housing & Rent", type: "expense", icon: "Home", color: "#3b82f6", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-2", user_id: null, name: "Groceries & Food", type: "expense", icon: "Utensils", color: "#10b981", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-3", user_id: null, name: "Transportation & Fuel", type: "expense", icon: "Car", color: "#f59e0b", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-4", user_id: null, name: "Shopping & Apparel", type: "expense", icon: "ShoppingBag", color: "#ec4899", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-5", user_id: null, name: "Entertainment & Leisure", type: "expense", icon: "Film", color: "#8b5cf6", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-6", user_id: null, name: "Healthcare & Medicine", type: "expense", icon: "HeartPulse", color: "#06b6d4", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-7", user_id: null, name: "Utilities & Bills", type: "expense", icon: "Zap", color: "#ef4444", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // System Default Income Categories
  { id: "sys-8", user_id: null, name: "Salary & Payroll", type: "income", icon: "Briefcase", color: "#10b981", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-9", user_id: null, name: "Investments & Dividends", type: "income", icon: "Landmark", color: "#06b6d4", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sys-10", user_id: null, name: "Freelance & Consulting", type: "income", icon: "DollarSign", color: "#3b82f6", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // System Default Transfer Category
  { id: "sys-11", user_id: null, name: "Account Transfer", type: "transfer", icon: "ArrowLeftRight", color: "#64748b", is_system: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

let localMemoryCategories: Category[] = [...SAMPLE_CATEGORIES];

export function useCategories() {
  const supabase = createClient();

  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return localMemoryCategories;
      }

      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase categories query error, using local memory fallback:", error.message);
        return localMemoryCategories;
      }

      const dbCategories = (data as Category[]) || [];
      const combined = [...dbCategories];
      for (const localCat of localMemoryCategories) {
        if (!combined.some((c) => c.id === localCat.id)) {
          combined.push(localCat);
        }
      }
      return combined;
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

      const newCategoryPayload: CategoryInsert = {
        user_id: user?.id || "demo-user",
        name: input.name,
        type: input.type,
        icon: input.icon || "Tag",
        color: input.color || "#3b82f6",
        is_system: false,
      };

      const createdLocal: Category = {
        id: `cat-${Date.now()}`,
        ...newCategoryPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Category;

      if (!user) {
        localMemoryCategories = [createdLocal, ...localMemoryCategories];
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
        console.warn("Could not upsert profile record prior to category creation:", profileErr);
      }

      let data: any = null;
      let error: any = null;

      try {
        const res = await (supabase as any)
          .from("categories")
          .insert(newCategoryPayload)
          .select()
          .single();
        data = res.data;
        error = res.error;
      } catch (err) {
        error = err;
      }

      if (error || !data) {
        console.warn("Supabase category insert warning, using local memory fallback:", error?.message);
        localMemoryCategories = [createdLocal, ...localMemoryCategories];
        return createdLocal;
      }

      const createdCat = data as Category;
      localMemoryCategories = [createdCat, ...localMemoryCategories.filter((c) => c.id !== createdCat.id)];
      return createdCat;
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

      const updatePayload: CategoryUpdate = {
        name: input.name,
        type: input.type,
        icon: input.icon,
        color: input.color,
        updated_at: new Date().toISOString(),
      };

      if (!user || id.startsWith("sys-") || id.startsWith("cat-")) {
        localMemoryCategories = localMemoryCategories.map((cat) =>
          cat.id === id ? ({ ...cat, ...updatePayload } as Category) : cat
        );
        return localMemoryCategories.find((cat) => cat.id === id);
      }

      const { data, error } = await (supabase as any)
        .from("categories")
        .update(updatePayload)
        .eq("id", id)
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

      if (!user || id.startsWith("sys-") || id.startsWith("cat-")) {
        localMemoryCategories = localMemoryCategories.filter((cat) => cat.id !== id);
        return id;
      }

      const { error } = await (supabase as any).from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
