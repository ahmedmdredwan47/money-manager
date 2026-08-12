import { calculateCryptoBdtValue } from "../../lib/crypto-valuation";

/** Keeps small quantities in normal decimal notation, never scientific notation. */
export function formatCryptoQuantity(quantity: string): string {
  const normalized = quantity.trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return quantity;
  const [integer, fraction] = normalized.split(".");
  const trimmedFraction = fraction?.replace(/0+$/, "");
  return trimmedFraction ? `${integer}.${trimmedFraction}` : integer;
}

export function cryptoBdtValueAsNumber(quantity: string, bdtPrice: string): number | null {
  try {
    const value = Number(calculateCryptoBdtValue(quantity, bdtPrice));
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
