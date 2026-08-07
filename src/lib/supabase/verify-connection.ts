import { createServerSupabaseClient } from "./server";
import { getSupabaseEnv } from "./env";

export interface ConnectionCheckResult {
  success: boolean;
  configured: boolean;
  message: string;
  timestamp: string;
  details?: {
    urlProvided: boolean;
    anonKeyProvided: boolean;
    databaseResponse?: string;
  };
}

/**
 * Checks connection status with the configured Supabase instance.
 */
export async function verifySupabaseConnection(): Promise<ConnectionCheckResult> {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  const timestamp = new Date().toISOString();

  if (!isConfigured) {
    return {
      success: false,
      configured: false,
      message:
        "Supabase credentials are missing or unconfigured in environment variables (.env.local).",
      timestamp,
      details: {
        urlProvided: Boolean(url),
        anonKeyProvided: Boolean(anonKey),
      },
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    // Test simple auth session query to verify project URL and anon key validity
    const { error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        configured: true,
        message: `Supabase reachable but returned error: ${error.message}`,
        timestamp,
        details: {
          urlProvided: true,
          anonKeyProvided: true,
          databaseResponse: error.message,
        },
      };
    }

    return {
      success: true,
      configured: true,
      message: "Supabase connection verified successfully! SDK and credentials are valid.",
      timestamp,
      details: {
        urlProvided: true,
        anonKeyProvided: true,
        databaseResponse: "OK",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      message: `Failed to connect to Supabase instance: ${err.message || "Unknown error"}`,
      timestamp,
      details: {
        urlProvided: true,
        anonKeyProvided: true,
        databaseResponse: err.message,
      },
    };
  }
}
