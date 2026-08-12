import { useQuery } from "@tanstack/react-query";
import { CryptoBdtPrice } from "@/lib/crypto-market-provider";

interface CryptoPricesResponse {
  prices: Record<string, CryptoBdtPrice>;
  usingLastKnownPrices: boolean;
  unavailableCodes: string[];
}

export function useCryptoPrices(codes: string[]) {
  const normalizedCodes = [...new Set(codes.map((code) => code.toUpperCase()))].sort();

  return useQuery<CryptoPricesResponse>({
    queryKey: ["crypto-prices-bdt", normalizedCodes],
    enabled: normalizedCodes.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/crypto-prices?codes=${encodeURIComponent(normalizedCodes.join(","))}`);
      if (!response.ok) throw new Error("Unable to load cryptocurrency prices");
      return response.json();
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
