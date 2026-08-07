import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";
import { Database } from "@/types/database";

/**
 * Creates a browser-side Supabase client for Client Components.
 * Automatically syncs with auth session state in the browser.
 */
export function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured && typeof window !== "undefined") {
    console.warn(
      "[Supabase Warning] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or unconfigured in .env.local"
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
