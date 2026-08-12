import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { CryptoHolding, CryptoHoldingInsert } from "@/types";

/**
 * Crypto quantities stay decimal strings from form/API input through to reads.
 * Do not parse these values with Number, parseFloat, or arithmetic operators.
 */
export interface CryptoHoldingInput {
  account_id: string;
  crypto_asset_id: string;
  quantity: string;
}

async function getHoldingWithTextQuantity(supabase: ReturnType<typeof createClient>, id: string) {
  const { data, error } = await (supabase as any)
    .from("crypto_holdings_with_quantity_text")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as CryptoHolding;
}

export function useCryptoHoldings() {
  const supabase = createClient();

  return useQuery<CryptoHolding[]>({
    queryKey: ["crypto-holdings"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from("crypto_holdings_with_quantity_text")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data as CryptoHolding[]) || [];
    },
  });
}

export function useCreateCryptoHolding() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: CryptoHoldingInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be signed in to create a crypto holding.");

      const payload: CryptoHoldingInsert = { ...input, user_id: user.id };
      const { data, error } = await (supabase as any)
        .from("crypto_holdings")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      return getHoldingWithTextQuantity(supabase, data.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crypto-holdings"] }),
  });
}

export function useUpdateCryptoHolding() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CryptoHoldingInput }) => {
      const { data, error } = await (supabase as any)
        .from("crypto_holdings")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      return getHoldingWithTextQuantity(supabase, data.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crypto-holdings"] }),
  });
}
