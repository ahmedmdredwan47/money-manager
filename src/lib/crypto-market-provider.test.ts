import { describe, expect, it } from "vitest";
import { CoinGeckoCryptoMarketPriceProvider } from "./crypto-market-provider";
import { getCurrentCryptoBdtPrices } from "./crypto-price-service";

if (!process.env.COINGECKO_API_KEY) {
  process.env.COINGECKO_API_KEY = "CG-EEXpJEDKh4uCyDz5btrqsJVb";
}


describe("CoinGeckoCryptoMarketPriceProvider", () => {
  it("fetches BDT prices for BTC, ETH, and USDT", async () => {
    const provider = new CoinGeckoCryptoMarketPriceProvider();
    const prices = await provider.getBdtPrices(["BTC", "ETH", "USDT"]);
    
    expect(prices).toHaveLength(3);
    
    const btc = prices.find((p) => p.code === "BTC");
    const eth = prices.find((p) => p.code === "ETH");
    const usdt = prices.find((p) => p.code === "USDT");

    expect(btc).toBeDefined();
    expect(Number(btc?.bdtPrice)).toBeGreaterThan(0);

    expect(eth).toBeDefined();
    expect(Number(eth?.bdtPrice)).toBeGreaterThan(0);

    expect(usdt).toBeDefined();
    expect(Number(usdt?.bdtPrice)).toBeGreaterThan(0);
  }, 15_000);

  it("handles unsupported tokens gracefully without throwing", async () => {
    const provider = new CoinGeckoCryptoMarketPriceProvider();
    const prices = await provider.getBdtPrices(["BTC", "UNSUPPORTED_TOKEN_XYZ"]);

    expect(prices).toHaveLength(1);
    expect(prices[0].code).toBe("BTC");
  }, 15_000);
});

describe("getCurrentCryptoBdtPrices", () => {
  it("returns prices and lists unsupported codes in unavailableCodes", async () => {
    const result = await getCurrentCryptoBdtPrices(["BTC", "ETH", "USDT", "UNSUPPORTED_TOKEN_XYZ"]);
    
    expect(result.prices["BTC"]).toBeDefined();
    expect(result.prices["ETH"]).toBeDefined();
    expect(result.prices["USDT"]).toBeDefined();
    expect(result.unavailableCodes).toEqual(["UNSUPPORTED_TOKEN_XYZ"]);
    expect(result.usingLastKnownPrices).toBe(false);
  }, 15_000);
});
