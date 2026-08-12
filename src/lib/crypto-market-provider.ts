import { marketPriceToDecimalString } from "./crypto-valuation";

export interface CryptoBdtPrice {
  code: string;
  bdtPrice: string;
  fetchedAt: string;
}

export interface CryptoMarketPriceProvider {
  getBdtPrices(codes: string[]): Promise<CryptoBdtPrice[]>;
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
};

/** CoinGecko implementation. Keep provider-specific IDs and HTTP details here. */
export class CoinGeckoCryptoMarketPriceProvider implements CryptoMarketPriceProvider {
  async getBdtPrices(codes: string[]): Promise<CryptoBdtPrice[]> {
    const normalizedCodes = [...new Set(codes.map((code) => code.trim().toUpperCase()))];

    const validCodeMap = normalizedCodes.reduce<Array<{ code: string; coinId: string }>>((acc, code) => {
      const coinId = COINGECKO_IDS[code];
      if (coinId) {
        acc.push({ code, coinId });
      }
      return acc;
    }, []);

    if (validCodeMap.length === 0) {
      return [];
    }

    const ids = validCodeMap.map((item) => item.coinId);

    const apiKey = process.env.COINGECKO_API_KEY;
    const isDemoKey = apiKey ? apiKey.startsWith("CG-") : false;
    const baseUrl = apiKey && !isDemoKey ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
    const headerName = isDemoKey ? "x-cg-demo-api-key" : apiKey ? "x-cg-pro-api-key" : undefined;

    const url = new URL(`${baseUrl}/simple/price`);
    url.searchParams.set("ids", ids.join(","));
    url.searchParams.set("vs_currencies", "bdt");
    url.searchParams.set("include_last_updated_at", "true");
    url.searchParams.set("precision", "18");

    const response = await fetch(url, {
      headers: apiKey && headerName ? { [headerName]: apiKey } : undefined,
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unable to read error body");
      console.error(`[crypto-market-provider] CoinGecko responded with HTTP ${response.status}:`, errorBody);
      throw new Error(`CoinGecko responded with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as Record<string, { bdt?: number | string; last_updated_at?: number }>;
    const fetchedAt = new Date().toISOString();

    const results: CryptoBdtPrice[] = [];
    for (const { code, coinId } of validCodeMap) {
      const quote = payload[coinId];
      if (quote?.bdt !== undefined && quote?.bdt !== null) {
        try {
          results.push({
            code,
            bdtPrice: marketPriceToDecimalString(quote.bdt),
            fetchedAt: quote.last_updated_at ? new Date(quote.last_updated_at * 1_000).toISOString() : fetchedAt,
          });
        } catch (err) {
          console.warn(`[crypto-market-provider] Could not parse BDT price for ${code}:`, err);
        }
      }
    }

    return results;
  }
}

