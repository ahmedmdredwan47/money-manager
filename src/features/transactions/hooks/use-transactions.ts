import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  TransactionWithCategoryAndAccount,
  TransactionInsert,
  TransactionUpdate,
} from "@/types";
import { TransactionFormInput } from "../schemas/transaction-schema";

export interface TransactionFilterOptions {
  type?: "all" | "income" | "expense" | "transfer";
  account_id?: string;
  category_id?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useTransactions(options: TransactionFilterOptions = {}) {
  const supabase = createClient();
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;

  return useQuery({
    queryKey: ["transactions", options],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 1,
        };
      }

      let query = (supabase as any)
        .from("transactions")
        .select(
          `
          *,
          account:accounts!transactions_account_id_fkey(id, name, type, currency),
          transfer_account:accounts!transactions_transfer_account_id_fkey(id, name, type, currency),
          category:categories(id, name, icon, color)
        `,
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (options.type && options.type !== "all") {
        query = query.eq("type", options.type);
      }
      if (options.account_id) {
        query = query.or(`account_id.eq.${options.account_id},transfer_account_id.eq.${options.account_id}`);
      }
      if (options.category_id) {
        query = query.eq("category_id", options.category_id);
      }
      if (options.search) {
        const s = `%${options.search}%`;
        query = query.or(`payee_merchant.ilike.${s},description.ilike.${s}`);
      }

      const fromIndex = (page - 1) * pageSize;
      const toIndex = fromIndex + pageSize - 1;
      query = query.range(fromIndex, toIndex);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error.message);
        throw new Error(error.message);
      }

      const totalCount = count || 0;
      return {
        data: (data as TransactionWithCategoryAndAccount[]) || [],
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
      };
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TransactionFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to create a transaction.");
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

      const txCurrency = input.currency || "BDT";
      let exchange_rate = 1.0;
      let bdt_amount = Number(input.amount) || 0;

      if (txCurrency !== "BDT") {
        try {
          const res = await fetch("/api/exchange-rates");
          if (res.ok) {
            const ratesJson = await res.json();
            const currentRate = ratesJson.rates?.[txCurrency];
            if (currentRate && currentRate > 0) {
              exchange_rate = currentRate;
              bdt_amount = (Number(input.amount) || 0) / currentRate;
            }
          }
        } catch {
          // Fallback gracefully
        }
      }

      const newTxPayload: any = {
        user_id: user.id,
        account_id: input.account_id,
        category_id: input.type === "transfer" ? null : input.category_id || null,
        transfer_account_id: input.type === "transfer" ? input.transfer_account_id || null : null,
        type: input.type,
        amount: input.amount,
        currency: txCurrency,
        exchange_rate,
        bdt_amount: Number(bdt_amount.toFixed(2)),
        date: input.date,
        payee_merchant: input.payee_merchant || null,
        description: input.description || null,
        status: input.status || "cleared",
      };

      const { data, error } = await (supabase as any)
        .from("transactions")
        .insert(newTxPayload)
        .select(`
          *,
          account:accounts!transactions_account_id_fkey(id, name, type, currency),
          transfer_account:accounts!transactions_transfer_account_id_fkey(id, name, type, currency),
          category:categories(id, name, icon, color)
        `)
        .single();

      if (error) throw new Error(error.message);

      // If transfer entry, adjust balances on accounts if required
      return data as TransactionWithCategoryAndAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TransactionFormInput }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to update a transaction.");
      }

      const txCurrency = input.currency || "BDT";
      let exchange_rate = 1.0;
      let bdt_amount = Number(input.amount) || 0;

      if (txCurrency !== "BDT") {
        try {
          const res = await fetch("/api/exchange-rates");
          if (res.ok) {
            const ratesJson = await res.json();
            const currentRate = ratesJson.rates?.[txCurrency];
            if (currentRate && currentRate > 0) {
              exchange_rate = currentRate;
              bdt_amount = (Number(input.amount) || 0) / currentRate;
            }
          }
        } catch {
          // Fallback gracefully
        }
      }

      const updatePayload: any = {
        account_id: input.account_id,
        category_id: input.type === "transfer" ? null : input.category_id || null,
        transfer_account_id: input.type === "transfer" ? input.transfer_account_id || null : null,
        type: input.type,
        amount: input.amount,
        currency: txCurrency,
        exchange_rate,
        bdt_amount: Number(bdt_amount.toFixed(2)),
        date: input.date,
        payee_merchant: input.payee_merchant || null,
        description: input.description || null,
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("transactions")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          *,
          account:accounts!transactions_account_id_fkey(id, name, type),
          transfer_account:accounts!transactions_transfer_account_id_fkey(id, name, type),
          category:categories(id, name, icon, color)
        `)
        .single();

      if (error) throw new Error(error.message);
      return data as TransactionWithCategoryAndAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to delete a transaction.");
      }

      const { error } = await (supabase as any)
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
