import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Account, AccountInsert, AccountUpdate } from "@/types";
import { AccountFormInput } from "../schemas/account-schema";

const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: "sample-1",
    user_id: "demo-user",
    name: "Brac Bank Savings",
    type: "bank",
    balance: 125400.50,
    currency: "BDT",
    account_number_last4: "4920",
    color: "#3b82f6",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    user_id: "demo-user",
    name: "Personal bKash Wallet",
    type: "bkash",
    balance: 14250.00,
    currency: "BDT",
    account_number_last4: "0178",
    color: "#e11d48",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    user_id: "demo-user",
    name: "Nagad Primary",
    type: "nagad",
    balance: 8500.00,
    currency: "BDT",
    account_number_last4: "8821",
    color: "#f97316",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-4",
    user_id: "demo-user",
    name: "Dutch-Bangla Rocket",
    type: "rocket",
    balance: 4320.75,
    currency: "BDT",
    account_number_last4: "3310",
    color: "#8b5cf6",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-5",
    user_id: "demo-user",
    name: "Physical Cash Wallet",
    type: "cash",
    balance: 6200.00,
    currency: "BDT",
    account_number_last4: null,
    color: "#10b981",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-6",
    user_id: "demo-user",
    name: "City Bank Visa Signature",
    type: "card",
    balance: -12450.00,
    currency: "BDT",
    account_number_last4: "8841",
    color: "#a855f7",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let localMemoryAccounts: Account[] = [...SAMPLE_ACCOUNTS];

export function useAccounts() {
  const supabase = createClient();

  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return localMemoryAccounts;
      }

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase accounts query error, using local memory fallback:", error.message);
        return localMemoryAccounts;
      }

      const dbAccounts = (data as Account[]) || [];
      const combined = [...dbAccounts];
      for (const localAcc of localMemoryAccounts) {
        if (!combined.some((a) => a.id === localAcc.id)) {
          combined.push(localAcc);
        }
      }
      return combined;
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

      const newAccountPayload: AccountInsert = {
        user_id: user?.id || "demo-user",
        name: input.name,
        type: input.type as any,
        balance: input.balance,
        currency: input.currency || "BDT",
        account_number_last4: input.account_number_last4 || null,
        color: input.color || null,
        is_active: input.is_active,
      };

      const createdLocal: Account = {
        id: `acc-${Date.now()}`,
        ...newAccountPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Account;

      if (!user) {
        localMemoryAccounts = [createdLocal, ...localMemoryAccounts];
        return createdLocal;
      }

      // Ensure profile row exists in public.profiles to satisfy accounts_user_id_fkey foreign key constraint
      try {
        await (supabase as any).from("profiles").upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            currency: input.currency || "BDT",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.warn("Could not upsert profile record prior to account creation:", profileErr);
      }

      let data: any = null;
      let error: any = null;

      try {
        const res = await (supabase as any)
          .from("accounts")
          .insert(newAccountPayload)
          .select()
          .single();
        data = res.data;
        error = res.error;
      } catch (err) {
        error = err;
      }

      if (error && error.message?.includes("accounts_type_check")) {
        const fallbackType = getFallbackAccountType(input.type);
        try {
          const retryResult = await (supabase as any)
            .from("accounts")
            .insert({ ...newAccountPayload, type: fallbackType })
            .select()
            .single();

          if (!retryResult.error) {
            data = retryResult.data;
            error = null;
          }
        } catch (err) {
          // ignore
        }
      }

      if (error || !data) {
        console.warn("Supabase account insert warning, using local memory fallback:", error?.message);
        localMemoryAccounts = [createdLocal, ...localMemoryAccounts];
        return createdLocal;
      }

      const createdAccount = data as Account;
      localMemoryAccounts = [createdAccount, ...localMemoryAccounts.filter((a) => a.id !== createdAccount.id)];
      return createdAccount;
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

      if (!user || id.startsWith("sample-") || id.startsWith("acc-")) {
        localMemoryAccounts = localMemoryAccounts.map((acc) =>
          acc.id === id ? ({ ...acc, ...updatePayload } as Account) : acc
        );
        return localMemoryAccounts.find((acc) => acc.id === id);
      }

      let { data, error } = await (supabase as any)
        .from("accounts")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error && error.message?.includes("accounts_type_check")) {
        const fallbackType = getFallbackAccountType(input.type);
        const retryResult = await (supabase as any)
          .from("accounts")
          .update({ ...updatePayload, type: fallbackType })
          .eq("id", id)
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

      if (!user || id.startsWith("sample-") || id.startsWith("acc-")) {
        localMemoryAccounts = localMemoryAccounts.filter((acc) => acc.id !== id);
        return id;
      }

      const { error } = await (supabase as any).from("accounts").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
