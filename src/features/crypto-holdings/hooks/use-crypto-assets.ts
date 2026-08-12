import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { CryptoAsset } from "@/types";

export function useCryptoAssets() {
  const supabase = createClient();

  return useQuery<CryptoAsset[]>({
    queryKey: ["crypto-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_assets")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw new Error(error.message);
      return (data as CryptoAsset[]) || [];
    },
  });
}
