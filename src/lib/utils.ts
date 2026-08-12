import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Converts an ISO timestamp string into a concise human-readable relative time string.
 * e.g. "just now", "5 min ago", "2 hours ago", "yesterday", "3 days ago"
 */
export function formatRelativeTime(isoString: string | undefined | null): string {
  if (!isoString) return "unknown";
  try {
    const then = new Date(isoString).getTime();
    const diffMs = Date.now() - then;
    if (isNaN(diffMs)) return "unknown";

    const diffSec  = Math.floor(diffMs / 1_000);
    const diffMin  = Math.floor(diffMs / 60_000);
    const diffHour = Math.floor(diffMs / 3_600_000);
    const diffDay  = Math.floor(diffMs / 86_400_000);

    if (diffSec < 60)  return "just now";
    if (diffMin < 60)  return `${diffMin} min ago`;
    if (diffHour < 24) return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
    if (diffDay  === 1) return "yesterday";
    return `${diffDay} days ago`;
  } catch {
    return "unknown";
  }
}
