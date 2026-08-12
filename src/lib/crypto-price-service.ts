import { CoinGeckoCryptoMarketPriceProvider, CryptoBdtPrice, CryptoMarketPriceProvider } from "./crypto-market-provider";

export interface CryptoPriceResult {
  prices: Record<string, CryptoBdtPrice>;
  usingLastKnownPrices: boolean;
  unavailableCodes: string[];
}

// Process-local resilience cache. Next.js fetch caching supplies the primary
// one-minute cache; this preserves the latest successful quote if a refresh fails.
const lastKnownPrices = new Map<string, CryptoBdtPrice>();

export async function getCurrentCryptoBdtPrices(
  codes: string[],
  provider: CryptoMarketPriceProvider = new CoinGeckoCryptoMarketPriceProvider()
): Promise<CryptoPriceResult> {
  const normalizedCodes = [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
  try {
    const quotes = await provider.getBdtPrices(normalizedCodes);
    quotes.forEach((quote) => lastKnownPrices.set(quote.code, quote));
    return {
      prices: Object.fromEntries(quotes.map((quote) => [quote.code, quote])),
      usingLastKnownPrices: false,
      unavailableCodes: normalizedCodes.filter((code) => !quotes.some((quote) => quote.code === code)),
    };
  } catch (error) {
    console.error("[crypto-price-service] Could not refresh crypto prices:", error);
    const prices = Object.fromEntries(
      normalizedCodes
        .map((code) => lastKnownPrices.get(code))
        .filter((quote): quote is CryptoBdtPrice => Boolean(quote))
        .map((quote) => [quote.code, quote])
    );
    return {
      prices,
      usingLastKnownPrices: Object.keys(prices).length > 0,
      unavailableCodes: normalizedCodes.filter((code) => !prices[code]),
    };
  }
}
