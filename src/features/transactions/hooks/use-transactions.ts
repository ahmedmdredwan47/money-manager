import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionInsert, TransactionUpdate, TransactionWithCategoryAndAccount } from "@/types";
import { TransactionFormInput } from "../schemas/transaction-schema";

export interface TransactionFilterOptions {
  type?: "all" | "income" | "expense" | "transfer";
  account_id?: string;
  category_id?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const SAMPLE_TRANSACTIONS: TransactionWithCategoryAndAccount[] = [
  {
    id: "tx-sample-1",
    user_id: "demo-user",
    account_id: "sample-1", // Brac Bank Savings
    category_id: "sys-8", // Salary
    transfer_account_id: null,
    type: "income",
    amount: 85000.00,
    currency: "BDT",
    date: "2026-08-01",
    payee_merchant: "Tech Corp BD",
    description: "Monthly Software Engineering Salary Payroll",
    status: "cleared",
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-01T09:00:00Z",
    account: { id: "sample-1", name: "Brac Bank Savings", type: "bank" } as any,
    category: { id: "sys-8", name: "Salary & Payroll", icon: "Briefcase", color: "#10b981" } as any,
  },
  {
    id: "tx-sample-2",
    user_id: "demo-user",
    account_id: "sample-2", // bKash
    category_id: "sys-2", // Groceries
    transfer_account_id: null,
    type: "expense",
    amount: 2450.00,
    currency: "BDT",
    date: "2026-08-03",
    payee_merchant: "Unimart Gulshan",
    description: "Weekly Grocery & Kitchen Supplies",
    status: "cleared",
    created_at: "2026-08-03T14:30:00Z",
    updated_at: "2026-08-03T14:30:00Z",
    account: { id: "sample-2", name: "Personal bKash Wallet", type: "bkash" } as any,
    category: { id: "sys-2", name: "Groceries & Food", icon: "Utensils", color: "#10b981" } as any,
  },
  {
    id: "tx-sample-3",
    user_id: "demo-user",
    account_id: "sample-1", // Brac Bank
    category_id: "sys-11", // Transfer
    transfer_account_id: "sample-2", // bKash
    type: "transfer",
    amount: 10000.00,
    currency: "BDT",
    date: "2026-08-04",
    payee_merchant: "bKash Cash In",
    description: "Bank to bKash Mobile Wallet Transfer",
    status: "cleared",
    created_at: "2026-08-04T11:15:00Z",
    updated_at: "2026-08-04T11:15:00Z",
    account: { id: "sample-1", name: "Brac Bank Savings", type: "bank" } as any,
    transfer_account: { id: "sample-2", name: "Personal bKash Wallet", type: "bkash" } as any,
    category: { id: "sys-11", name: "Account Transfer", icon: "ArrowLeftRight", color: "#64748b" } as any,
  },
  {
    id: "tx-sample-4",
    user_id: "demo-user",
    account_id: "sample-5", // Cash Wallet
    category_id: "sys-3", // Transportation
    transfer_account_id: null,
    type: "expense",
    amount: 450.00,
    currency: "BDT",
    date: "2026-08-05",
    payee_merchant: "Uber Ride",
    description: "Commute to Office Meeting",
    status: "cleared",
    created_at: "2026-08-05T18:20:00Z",
    updated_at: "2026-08-05T18:20:00Z",
    account: { id: "sample-5", name: "Physical Cash Wallet", type: "cash" } as any,
    category: { id: "sys-3", name: "Transportation & Fuel", icon: "Car", color: "#f59e0b" } as any,
  },
  {
    id: "tx-sample-5",
    user_id: "demo-user",
    account_id: "sample-1", // Brac Bank
    category_id: "sys-10", // Freelance
    transfer_account_id: null,
    type: "income",
    amount: 32000.00,
    currency: "BDT",
    date: "2026-08-05",
    payee_merchant: "Upwork Global",
    description: "UI/UX Design Contract Payment",
    status: "cleared",
    created_at: "2026-08-05T20:00:00Z",
    updated_at: "2026-08-05T20:00:00Z",
    account: { id: "sample-1", name: "Brac Bank Savings", type: "bank" } as any,
    category: { id: "sys-10", name: "Freelance & Consulting", icon: "DollarSign", color: "#3b82f6" } as any,
  },
];

let localMemoryTransactions: TransactionWithCategoryAndAccount[] = [...SAMPLE_TRANSACTIONS];

export function useTransactions(options: TransactionFilterOptions = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["transactions", options],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return filterAndPaginateLocalMemory(options);
      }

      let query = (supabase as any)
        .from("transactions")
        .select(`
          *,
          account:accounts!transactions_account_id_fkey(id, name, type),
          transfer_account:accounts!transactions_transfer_account_id_fkey(id, name, type),
          category:categories(id, name, icon, color)
        `, { count: "exact" })
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

      const { data, error } = await query;

      if (error) {
        console.warn("Supabase transactions query error, using local memory fallback:", error.message);
        return filterAndPaginateLocalMemory(options);
      }

      const dbList = (data as TransactionWithCategoryAndAccount[]) || [];
      const combined = [...dbList];
      for (const localTx of localMemoryTransactions) {
        if (!combined.some((t) => t.id === localTx.id)) {
          combined.push(localTx);
        }
      }

      return filterAndPaginateLocalMemory(options, combined);
    },
  });
}

function filterAndPaginateLocalMemory(
  options: TransactionFilterOptions,
  customList?: TransactionWithCategoryAndAccount[]
) {
  let list = customList ? [...customList] : [...localMemoryTransactions];

  if (options.type && options.type !== "all") {
    list = list.filter((tx) => tx.type === options.type);
  }
  if (options.account_id) {
    list = list.filter(
      (tx) => tx.account_id === options.account_id || tx.transfer_account_id === options.account_id
    );
  }
  if (options.category_id) {
    list = list.filter((tx) => tx.category_id === options.category_id);
  }
  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(
      (tx) =>
        (tx.payee_merchant && tx.payee_merchant.toLowerCase().includes(s)) ||
        (tx.description && tx.description.toLowerCase().includes(s)) ||
        (tx.account?.name && tx.account.name.toLowerCase().includes(s)) ||
        (tx.category?.name && tx.category.name.toLowerCase().includes(s))
    );
  }

  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const totalCount = list.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = list.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
  };
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: TransactionFormInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newTxPayload: TransactionInsert = {
        user_id: user?.id || "demo-user",
        account_id: input.account_id,
        category_id: input.type === "transfer" ? null : input.category_id || null,
        transfer_account_id: input.type === "transfer" ? input.transfer_account_id || null : null,
        type: input.type,
        amount: input.amount,
        currency: input.currency || "BDT",
        date: input.date,
        payee_merchant: input.payee_merchant || null,
        description: input.description || null,
        status: input.status || "cleared",
      };

      const createdLocal: TransactionWithCategoryAndAccount = {
        id: `tx-${Date.now()}`,
        ...newTxPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        account: { id: input.account_id, name: "Selected Account", type: "bank" } as any,
        transfer_account: input.transfer_account_id
          ? ({ id: input.transfer_account_id, name: "Destination Account", type: "mfs" } as any)
          : null,
        category: input.category_id
          ? ({ id: input.category_id, name: "Selected Category", icon: "Tag", color: "#10b981" } as any)
          : null,
      } as TransactionWithCategoryAndAccount;

      if (!user) {
        localMemoryTransactions = [createdLocal, ...localMemoryTransactions];
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
        console.warn("Could not upsert profile record prior to transaction creation:", profileErr);
      }

      let data: any = null;
      let error: any = null;

      try {
        const res = await (supabase as any)
          .from("transactions")
          .insert(newTxPayload)
          .select(`
            *,
            account:accounts!transactions_account_id_fkey(id, name, type),
            transfer_account:accounts!transactions_transfer_account_id_fkey(id, name, type),
            category:categories(id, name, icon, color)
          `)
          .single();
        data = res.data;
        error = res.error;
      } catch (err) {
        error = err;
      }

      if (error || !data) {
        console.warn("Supabase transaction insert fallback to local memory:", error?.message);
        localMemoryTransactions = [createdLocal, ...localMemoryTransactions];
        return createdLocal;
      }

      const createdTx = data as TransactionWithCategoryAndAccount;
      localMemoryTransactions = [createdTx, ...localMemoryTransactions.filter((t) => t.id !== createdTx.id)];
      return createdTx;
    },

    // Optimistic Update
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousData = queryClient.getQueryData(["transactions"]);

      // Optimistically inject placeholder item into query cache
      queryClient.setQueriesData({ queryKey: ["transactions"] }, (old: any) => {
        if (!old || !old.data) return old;
        const optimisticItem: TransactionWithCategoryAndAccount = {
          id: `temp-${Date.now()}`,
          user_id: "demo-user",
          account_id: newTx.account_id,
          category_id: newTx.category_id || null,
          transfer_account_id: newTx.transfer_account_id || null,
          type: newTx.type,
          amount: newTx.amount,
          currency: newTx.currency || "BDT",
          date: newTx.date,
          payee_merchant: newTx.payee_merchant || null,
          description: newTx.description || null,
          status: newTx.status || "cleared",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;

        return {
          ...old,
          data: [optimisticItem, ...old.data],
          totalCount: (old.totalCount || 0) + 1,
        };
      });

      return { previousData };
    },
    onError: (err, newTx, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(["transactions"], context.previousData);
      }
    },
    onSettled: () => {
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

      const updatePayload: TransactionUpdate = {
        account_id: input.account_id,
        category_id: input.type === "transfer" ? null : input.category_id || null,
        transfer_account_id: input.type === "transfer" ? input.transfer_account_id || null : null,
        type: input.type,
        amount: input.amount,
        currency: input.currency,
        date: input.date,
        payee_merchant: input.payee_merchant || null,
        description: input.description || null,
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      if (!user || id.startsWith("tx-sample-") || id.startsWith("tx-")) {
        localMemoryTransactions = localMemoryTransactions.map((tx) =>
          tx.id === id ? ({ ...tx, ...updatePayload } as TransactionWithCategoryAndAccount) : tx
        );
        return localMemoryTransactions.find((tx) => tx.id === id);
      }

      const { data, error } = await (supabase as any)
        .from("transactions")
        .update(updatePayload)
        .eq("id", id)
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

      if (!user || id.startsWith("tx-sample-") || id.startsWith("tx-")) {
        localMemoryTransactions = localMemoryTransactions.filter((tx) => tx.id !== id);
        return id;
      }

      const { error } = await (supabase as any).from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },

    // Optimistic Delete
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousData = queryClient.getQueryData(["transactions"]);

      queryClient.setQueriesData({ queryKey: ["transactions"] }, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter((item: any) => item.id !== deletedId),
          totalCount: Math.max((old.totalCount || 1) - 1, 0),
        };
      });

      return { previousData };
    },
    onError: (err, deletedId, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(["transactions"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
