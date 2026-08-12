"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, Plus, ShoppingBag, Home, CreditCard } from "lucide-react";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useExchangeRates, getTransactionBdtAmount } from "@/lib/exchange-rates";
import { TransactionFormDialog } from "@/features/transactions/components/transaction-form-dialog";

export function ExpensesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: txResult, isLoading } = useTransactions({ type: "expense", pageSize: 100 });
  const { data: ratesData } = useExchangeRates();

  const expenses = txResult?.data || [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const rates = ratesData?.rates ?? { BDT: 1 };

  // Calculate dynamic expense metrics in BDT
  const monthlyExpenseTotal = expenses
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

  const fixedHousingTotal = expenses
    .filter((t) => t.category?.name?.toLowerCase().includes("housing") || t.category?.name?.toLowerCase().includes("rent"))
    .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

  const subscriptionsTotal = expenses
    .filter((t) => t.category?.name?.toLowerCase().includes("entertainment") || t.category?.name?.toLowerCase().includes("utility"))
    .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Tracker"
        description="Monitor spending habits, bills, recurring subscriptions, and daily expenses."
        action={
          <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Log Expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Expenses</CardTitle>
            <ShoppingBag className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(monthlyExpenseTotal, "BDT")}</div>
            <p className="text-xs text-muted-foreground mt-1">Total expenses logged this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Housing & Utilities</CardTitle>
            <Home className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(fixedHousingTotal, "BDT")}</div>
            <p className="text-xs text-muted-foreground mt-1">Total spent on housing & bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entertainment & Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(subscriptionsTotal, "BDT")}</div>
            <p className="text-xs text-muted-foreground mt-1">Total spent on leisure & subscriptions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Log</CardTitle>
          <CardDescription>Recent outflow entries with categories and payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
              <ShoppingBag className="mx-auto h-8 w-8 opacity-40" />
              <p>No expense entries logged yet.</p>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-3.5 w-3.5" /> Log First Expense
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3">Merchant / Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {expenses.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                          <TrendingDown className="h-4 w-4" />
                        </div>
                        {row.payee_merchant || row.description || "Expense Entry"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline">{row.category?.name || "Uncategorized"}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{row.account?.name || "Cash"}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{row.date}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-rose-500 font-mono">
                        -{formatCurrency(row.amount, row.currency || "BDT")}
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
