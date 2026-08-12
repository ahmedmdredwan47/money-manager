import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Account, AccountInsert, AccountUpdate } from "@/types";
import { AccountFormInput } from "../schemas/account-schema";

export function useAccounts() {
  const supabase = createClient();

  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching accounts:", error.message);
        throw new Error(error.message);
      }

      return (data as Account[]) || [];
    },
  });
}

function getFallbackAccountType(type: string): string {
  switch (type) {
    case "bank":
      return "checking";
    case "card":
      return "credit_card";
    case "cash":
      return "cash";
    case "bkash":
    case "nagad":
    case "rocket":
      return "other";
    default:
      return "other";
  }
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: AccountFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to create an account.");
      }

      // Ensure profile row exists in public.profiles
      try {
        await (supabase as any).from("profiles").upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            currency: "BDT", // BDT is the fixed base/reporting currency — never inherit from account
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.warn("Could not upsert profile record:", profileErr);
      }

      const newAccountPayload: AccountInsert = {
        user_id: user.id,
        name: input.name,
        type: input.type as any,
        balance: input.balance,
        currency: input.currency || "BDT",
        account_number_last4: input.account_number_last4 || null,
        color: input.color || null,
        is_active: input.is_active,
      };

      let { data, error } = await (supabase as any)
        .from("accounts")
        .insert(newAccountPayload)
        .select()
        .single();

      if (error && error.message?.includes("accounts_type_check")) {
        const fallbackType = getFallbackAccountType(input.type);
        const retryResult = await (supabase as any)
          .from("accounts")
          .insert({ ...newAccountPayload, type: fallbackType })
          .select()
          .single();

        if (!retryResult.error) {
          data = retryResult.data;
          error = null;
        }
      }

      if (error) throw new Error(error.message);
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AccountFormInput }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to update an account.");
      }

      const updatePayload: AccountUpdate = {
        name: input.name,
        type: input.type as any,
        balance: input.balance,
        currency: input.currency,
        account_number_last4: input.account_number_last4 || null,
        color: input.color || null,
        is_active: input.is_active,
        updated_at: new Date().toISOString(),
      };

      let { data, error } = await (supabase as any)
        .from("accounts")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error && error.message?.includes("accounts_type_check")) {
        const fallbackType = getFallbackAccountType(input.type);
        const retryResult = await (supabase as any)
          .from("accounts")
          .update({ ...updatePayload, type: fallbackType })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (!retryResult.error) {
          data = retryResult.data;
          error = null;
        }
      }

      if (error) throw new Error(error.message);
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to delete an account.");
      }

      const { error } = await (supabase as any)
        .from("accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
