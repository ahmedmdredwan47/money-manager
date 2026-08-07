"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const supabase = createClient();

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setSuccessMessage(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email address."
      );
    } catch (err: any) {
      setError(err.message || "Failed to request password reset.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/60 backdrop-blur-lg bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your registered email address and we&apos;ll send you a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20 animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

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

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-10 font-semibold shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border/40">
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
