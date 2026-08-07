"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const supabase = createClient();

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccessMessage("Your password has been reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/60 backdrop-blur-lg bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below to update your security credentials.
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
            <label className="text-xs font-semibold text-muted-foreground">New Password</label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="pl-9 h-10"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 font-medium mt-1">
                {errors.confirmPassword.message}
              </p>
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
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
