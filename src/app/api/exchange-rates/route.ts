import { NextResponse } from "next/server";
import { FALLBACK_RATES } from "@/lib/exchange-rates";

/**
 * GET /api/exchange-rates
 *
 * Server-side proxy that fetches live BDT-based exchange rates from
 * ExchangeRate-API (https://www.exchangerate-api.com/).
 *
 * The API key is read from the EXCHANGE_RATE_API_KEY environment variable
 * and is NEVER exposed to the browser.
 *
 * Response shape:
 *   { rates: Record<string, number>, usingFallback: boolean, fetchedAt: string }
 *
 * The route uses Next.js caching (revalidate: 3600) so the external API is
 * called at most once per hour per deployment, keeping well within the free
 * tier limit of 1,500 requests/month.
 */

// Tell Next.js to cache this route's response for 1 hour server-side.
export const revalidate = 3600;

export async function GET() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // -----------------------------------------------------------------------
  // No API key configured — return fallback rates with a clear signal.
  // -----------------------------------------------------------------------
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-exchangerate-api-key-here") {
    return NextResponse.json(
      {
        rates: FALLBACK_RATES,
        usingFallback: true,
        fallbackReason: "EXCHANGE_RATE_API_KEY is not configured. Add it to .env.local.",
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          // Allow browser to cache for 1 hour even without a key
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // -----------------------------------------------------------------------
  // Fetch live rates from ExchangeRate-API with BDT as the base currency.
  // Response shape: { result: "success", conversion_rates: { USD: 0.00817, ... } }
  // -----------------------------------------------------------------------
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/BDT`,
      {
        // next.revalidate is redundant here (file-level `export const revalidate` above
        // handles it) but explicit for clarity.
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10_000), // 10-second timeout
      }
    );

    if (!res.ok) {
      throw new Error(`ExchangeRate-API responded with HTTP ${res.status}`);
    }

    const json = await res.json();

    if (json.result !== "success" || !json.conversion_rates) {
      throw new Error(
        `Unexpected API response: result="${json.result}", error_type="${json["error-type"] ?? "unknown"}"`
      );
    }

    const rates: Record<string, number> = {
      BDT: 1, // Base currency — always 1:1 with itself
      ...json.conversion_rates,
    };

    return NextResponse.json(
      {
        rates,
        usingFallback: false,
        fetchedAt: json.time_last_update_utc ?? new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    // Log server-side for debugging, but return gracefully to the client.
    console.error("[/api/exchange-rates] Failed to fetch live rates:", err?.message ?? err);

    return NextResponse.json(
      {
        rates: FALLBACK_RATES,
        usingFallback: true,
        fallbackReason: `Live rate fetch failed: ${err?.message ?? "Unknown error"}`,
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 200, // Still 200 — the client gets usable fallback data
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  }
}
