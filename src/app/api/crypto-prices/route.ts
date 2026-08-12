import { NextRequest, NextResponse } from "next/server";
import { getCurrentCryptoBdtPrices } from "@/lib/crypto-price-service";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const requestedCodes = request.nextUrl.searchParams.get("codes")
      ?.split(",")
      .map((code) => code.trim())
      .filter(Boolean) ?? ["BTC", "ETH", "USDT"];

    const result = await getCurrentCryptoBdtPrices(requestedCodes);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[api/crypto-prices] Unexpected error fetching crypto prices:", error);
    return NextResponse.json(
      { error: "Unable to retrieve cryptocurrency prices" },
      { status: 500 }
    );
  }
}

