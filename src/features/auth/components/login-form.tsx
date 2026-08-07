"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "../schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Loader2, LogIn, Lock, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const supabase = createClient();

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google authentication.");
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/60 backdrop-blur-lg bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your WealthWise Money Manager account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google SSO Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={googleLoading || isSubmitting}
          className="w-full h-10 font-medium flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>

        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <span className="relative bg-card px-2 text-xs font-semibold text-muted-foreground uppercase">
            Or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className="pl-9 h-10"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-emerald-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="pl-9 h-10"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-10 font-semibold shadow-md"
            disabled={isSubmitting || googleLoading}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            <span>Sign In</span>
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-emerald-500 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
