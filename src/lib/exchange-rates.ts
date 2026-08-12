import { useQuery } from "@tanstack/react-query";

/**
 * Emergency fallback rates (BDT-denominated).
 * Used ONLY when both the live API and the internal API route are unreachable.
 * These are intentionally kept up-to-date manually as a last resort.
 *
 * Format: rates[X] = how many X per 1 BDT
 * Conversion: amount_in_BDT = amount_in_X / rates[X]
 *
 * NOTE: Do NOT use these for financial precision.
 * The live path via /api/exchange-rates → ExchangeRate-API is always preferred.
 */
export const FALLBACK_RATES: Record<string, number> = {
  BDT: 1,
  USD: 0.00817,
  EUR: 0.00756,
  GBP: 0.00643,
  INR: 0.68220,
  AUD: 0.01264,
  CAD: 0.01117,
  SGD: 0.01097,
  AED: 0.03000,
  SAR: 0.03063,
  JPY: 1.24500,
  CNY: 0.05920,
};

export interface ExchangeRates {
  /** BDT-denominated rates: rates[X] = how many X per 1 BDT */
  rates: Record<string, number>;
  /** True when the live ExchangeRate-API call failed and fallback data is being served */
  usingFallback: boolean;
  /** ISO timestamp of when the rate data was last fetched from the upstream source */
  fetchedAt?: string;
}

/**
 * Client-side hook that retrieves live exchange rates from the internal
 * Next.js API route (/api/exchange-rates).
 *
 * The API route handles:
 *  - Authenticating with ExchangeRate-API using the server-side API key
 *  - Server-side caching (revalidate every hour)
 *  - Graceful fallback if the upstream API is unavailable
 *
 * This hook adds an additional client-side React Query cache (staleTime: 1 hour)
 * so the /api/exchange-rates route is called at most once per browser session hour.
 */
const LAST_KNOWN_RATES_KEY = "money_manager_last_known_rates";

export function useExchangeRates() {
  return useQuery<ExchangeRates>({
    queryKey: ["exchange-rates-bdt"],
    queryFn: async (): Promise<ExchangeRates> => {
      try {
        const res = await fetch("/api/exchange-rates", {
          signal: AbortSignal.timeout(12_000),
        });

        if (!res.ok) {
          throw new Error(`Internal API responded with HTTP ${res.status}`);
        }

        const json = await res.json();
        const payload: ExchangeRates = {
          rates: json.rates as Record<string, number>,
          usingFallback: json.usingFallback as boolean,
          fetchedAt: json.fetchedAt as string | undefined,
        };

        // Cache last-known valid rates locally for offline resilience
        if (typeof window !== "undefined" && payload.rates && !payload.usingFallback) {
          try {
            localStorage.setItem(LAST_KNOWN_RATES_KEY, JSON.stringify(payload));
          } catch {
            // Storage quota warning ignored
          }
        }

        return payload;
      } catch (err: any) {
        console.warn("[useExchangeRates] Could not reach /api/exchange-rates:", err?.message);

        // 1. Try reading last-known valid exchange rates from localStorage
        if (typeof window !== "undefined") {
          try {
            const cachedStr = localStorage.getItem(LAST_KNOWN_RATES_KEY);
            if (cachedStr) {
              const cached = JSON.parse(cachedStr);
              if (cached.rates && typeof cached.rates === "object") {
                return {
                  rates: cached.rates,
                  usingFallback: true,
                  fetchedAt: cached.fetchedAt,
                };
              }
            }
          } catch {
            // Ignore parse error
          }
        }

        // 2. Last resort offline fallback rates
        return { rates: FALLBACK_RATES, usingFallback: true };
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime:    60 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Converts an amount in any supported currency to BDT.
 *
 * The `rates` map is BDT-denominated:
 *   rates[X] = how many X per 1 BDT
 *   ∴ amount_in_BDT = amount_in_X / rates[X]
 *
 * If no valid rate exists for the given foreign currency, returns `null`
 * to clearly indicate that BDT conversion is unavailable, strictly avoiding
 * any misleading 1:1 conversion.
 */
export function convertToBDT(
  amount: number,
  currency: string,
  rates: Record<string, number>
): number | null {
  if (!currency || currency === "BDT") return amount;
  const rate = rates[currency];
  if (!rate || rate === 0) {
    console.warn(`[convertToBDT] Rate missing for foreign currency "${currency}". Conversion unavailable.`);
    return null; // Signals rate unavailable — DO NOT treat foreign currency as 1:1 BDT!
  }
  return amount / rate;
}

/**
 * Converts an amount from one currency to another using BDT-denominated rates.
 * Returns `null` if rate is unavailable.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number | null {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount;
  const amountInBDT = convertToBDT(amount, fromCurrency, rates);
  if (amountInBDT === null) return null;
  if (toCurrency === "BDT") return amountInBDT;
  const targetRate = rates[toCurrency];
  if (!targetRate) return null;
  return amountInBDT * targetRate;
}

/**
 * Returns the BDT-equivalent amount of a transaction.
 * Prioritizes the historical locked `bdt_amount` if recorded at transaction time.
 * Falls back to converting using current rates if historical amount is not stored.
 */
export function getTransactionBdtAmount(
  transaction: {
    amount: number;
    currency?: string | null;
    bdt_amount?: number | null;
    account?: { currency?: string | null } | null;
  },
  rates: Record<string, number>
): number {
  if (
    transaction.bdt_amount !== undefined &&
    transaction.bdt_amount !== null &&
    Number(transaction.bdt_amount) > 0
  ) {
    return Number(transaction.bdt_amount);
  }
  const currency = transaction.currency || transaction.account?.currency || "BDT";
  const bdtVal = convertToBDT(Number(transaction.amount) || 0, currency, rates);
  return bdtVal !== null ? bdtVal : 0;
}


