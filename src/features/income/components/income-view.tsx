"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Plus, DollarSign, Calendar, Briefcase } from "lucide-react";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useExchangeRates, getTransactionBdtAmount } from "@/lib/exchange-rates";
import { TransactionFormDialog } from "@/features/transactions/components/transaction-form-dialog";

export function IncomeView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: txResult, isLoading } = useTransactions({ type: "income", pageSize: 100 });
  const { data: ratesData } = useExchangeRates();

  const incomes = txResult?.data || [];
  const currentYear = new Date().getFullYear();
  const rates = ratesData?.rates ?? { BDT: 1 };

  // Calculate dynamic income metrics in BDT
  const totalYtdIncome = incomes
    .filter((t) => new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

  const activeStreamsCount = new Set(incomes.map((t) => t.category?.name || "General")).size;

  const primaryStream = incomes.reduce((acc, t) => {
    const name = t.category?.name || t.payee_merchant || "General Income";
    acc[name] = (acc[name] || 0) + getTransactionBdtAmount(t, rates);
    return acc;
  }, {} as Record<string, number>);

  const primarySourceEntry = Object.entries(primaryStream).sort((a, b) => b[1] - a[1])[0];
  const primarySourceName = primarySourceEntry ? primarySourceEntry[0] : "No Active Stream";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Streams"
        description="Track and manage all sources of revenue, salary, investments, and side hustles."
        action={
          <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Income Entry
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total YTD Income</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(totalYtdIncome, "BDT")}</div>
            <p className="text-xs text-emerald-500 font-semibold mt-1">Earned this calendar year (BDT)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streams</CardTitle>
            <Calendar className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{activeStreamsCount} Sources</div>
            <p className="text-xs text-muted-foreground mt-1">Unique income channels logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Primary Income Source</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{primarySourceName}</div>
            <p className="text-xs text-emerald-500 mt-1 font-semibold">Top revenue contributor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>Structured list of received income streams</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
              Loading income entries...
            </div>
          ) : incomes.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
              <DollarSign className="mx-auto h-8 w-8 opacity-40" />
              <p>No income streams logged yet.</p>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-3.5 w-3.5" /> Add First Income Entry
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3">Source Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {incomes.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        {row.payee_merchant || row.description || "Income Entry"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{row.category?.name || "General Income"}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{row.date}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="success">{row.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-emerald-500 font-mono">
                        +{formatCurrency(row.amount, row.currency || "BDT")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
