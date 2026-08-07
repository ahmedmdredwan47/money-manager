import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const protectedRoutes = [
  "/dashboard",
  "/income",
  "/expenses",
  "/transactions",
  "/accounts",
  "/categories",
  "/budget",
  "/savings-goals",
  "/reports",
  "/settings",
  "/profile",
];

const authRoutes = ["/login", "/signup", "/forgot-password"];

/**
 * Updates auth session cookies and enforces protected/public route access rules.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  // If Supabase environment variables are not configured yet, allow viewing preview pages
  if (!isConfigured) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rule 1: Redirect unauthenticated user accessing protected routes to /login
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rule 2: Redirect authenticated user accessing auth routes to /dashboard
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (user && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
