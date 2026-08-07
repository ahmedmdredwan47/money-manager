"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, RefreshCw, Database, User, Link as LinkIcon } from "lucide-react";

interface DebugData {
  userId: string | null;
  userEmail: string | null;
  supabaseUrl: string;
  authSuccess: boolean;
  authError: string | null;
  accountsCount: number;
  accountsError: string | null;
  categoriesCount: number;
  categoriesError: string | null;
  transactionsCount: number;
  transactionsError: string | null;
}

export default function DebugPage() {
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);

  const runDebugCheck = async () => {
    setLoading(true);
    const supabase = createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set";

    let userId: string | null = null;
    let userEmail: string | null = null;
    let authSuccess = false;
    let authError: string | null = null;

    let accountsCount = 0;
    let accountsError: string | null = null;

    let categoriesCount = 0;
    let categoriesError: string | null = null;

    let transactionsCount = 0;
    let transactionsError: string | null = null;

    try {
      const { data: authData, error: getUserErr } = await supabase.auth.getUser();
      if (getUserErr) {
        authError = getUserErr.message;
      } else if (authData.user) {
        authSuccess = true;
        userId = authData.user.id;
        userEmail = authData.user.email || null;
      }

      if (authSuccess && userId) {
        // Fetch accounts
        const { data: accs, error: accErr } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", userId);
        if (accErr) accountsError = accErr.message;
        else accountsCount = accs?.length || 0;

        // Fetch categories
        const { data: cats, error: catErr } = await (supabase as any)
          .from("categories")
          .select("*")
          .or(`user_id.eq.${userId},is_system.eq.true`);
        if (catErr) categoriesError = catErr.message;
        else categoriesCount = cats?.length || 0;

        // Fetch transactions
        const { data: txs, count: txCount, error: txErr } = await (supabase as any)
          .from("transactions")
          .select("*", { count: "exact" })
          .eq("user_id", userId);
        if (txErr) transactionsError = txErr.message;
        else transactionsCount = txCount !== null ? txCount : txs?.length || 0;
      }
    } catch (err: any) {
      authError = err.message || "Unknown client error";
    }

    setData({
      userId,
      userEmail,
      supabaseUrl,
      authSuccess,
      authError,
      accountsCount,
      accountsError,
      categoriesCount,
      categoriesError,
      transactionsCount,
      transactionsError,
    });
    setLoading(false);
  };

  useEffect(() => {
    runDebugCheck();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      <PageHeader
        title="Production Auth & Data Debugger"
        description="Temporary diagnostic page to verify Supabase Auth, RLS policies, and PostgreSQL query state."
        action={
          <Button variant="outline" size="sm" onClick={runDebugCheck} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Re-run Diagnostics
          </Button>
        }
      />

      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Running diagnostic queries against Supabase...
        </Card>
      ) : data ? (
        <div className="grid grid-cols-1 gap-4">
          {/* 1. Supabase Environment & Auth Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" /> Supabase Connection & Auth State
                </CardTitle>
                <Badge variant={data.authSuccess ? "success" : "destructive"}>
                  {data.authSuccess ? "Authenticated" : "Unauthenticated / Failed"}
                </Badge>
              </div>
              <CardDescription>Target project URL & session details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 gap-1">
                <span className="text-muted-foreground font-sans font-medium">Supabase Project URL:</span>
                <span className="text-foreground font-semibold break-all">{data.supabaseUrl}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 gap-1">
                <span className="text-muted-foreground font-sans font-medium">auth.getUser() Status:</span>
                <span className={data.authSuccess ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                  {data.authSuccess ? "SUCCESS" : `FAILED (${data.authError || "No active session"})`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 gap-1">
                <span className="text-muted-foreground font-sans font-medium">User ID (auth.uid()):</span>
                <span className="text-foreground font-semibold break-all">{data.userId || "null"}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 gap-1">
                <span className="text-muted-foreground font-sans font-medium">User Email:</span>
                <span className="text-foreground font-semibold break-all">{data.userEmail || "null"}</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. User Data Records Diagnostics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-500" /> PostgreSQL Table Records (Scoped to auth.uid())
              </CardTitle>
              <CardDescription>Number of records returned from Supabase PostgreSQL tables</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Accounts Returned</p>
                <p className="text-2xl font-bold font-mono">{data.accountsCount}</p>
                {data.accountsError && (
                  <p className="text-[11px] text-rose-500 font-sans">{data.accountsError}</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Categories Returned</p>
                <p className="text-2xl font-bold font-mono">{data.categoriesCount}</p>
                {data.categoriesError && (
                  <p className="text-[11px] text-rose-500 font-sans">{data.categoriesError}</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Transactions Returned</p>
                <p className="text-2xl font-bold font-mono">{data.transactionsCount}</p>
                {data.transactionsError && (
                  <p className="text-[11px] text-rose-500 font-sans">{data.transactionsError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
