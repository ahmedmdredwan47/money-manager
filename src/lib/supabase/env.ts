/**
 * Environment Variable Helper for Supabase Integration.
 * Enforces strict validation to avoid hardcoding secrets or missing configuration.
 */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isConfigured =
    Boolean(url) &&
    Boolean(anonKey) &&
    url !== "https://your-supabase-project.supabase.co" &&
    anonKey !== "your-supabase-anon-key";

  return {
    url: url || "",
    anonKey: anonKey || "",
    serviceRoleKey: serviceRoleKey || "",
    isConfigured,
  };
}
