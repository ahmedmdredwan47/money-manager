"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, Plus, Filter, ShoppingBag, Home, CreditCard } from "lucide-react";

export function ExpensesView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Tracker"
        description="Monitor spending habits, bills, recurring subscriptions, and daily expenses."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="gradient" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Log Expense
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
            <ShoppingBag className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(3800.00)}</div>
            <p className="text-xs text-rose-500 font-semibold mt-1">-3.1% compared to last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fixed Housing & Utilities</CardTitle>
            <Home className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(1950.00)}</div>
            <p className="text-xs text-muted-foreground mt-1">51% of monthly budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscriptions & Entertainment</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(320.00)}</div>
            <p className="text-xs text-muted-foreground mt-1">8 recurring services</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Log Backbone</CardTitle>
          <CardDescription>Recent outflow entries with categories and payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                <tr>
                  <th className="px-4 py-3">Merchant / Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  { title: "Organic Market", category: "Groceries", account: "Visa Platinum", date: "Aug 05, 2026", amount: 142.80 },
                  { title: "City Electric Co", category: "Utilities", date: "Aug 03, 2026", account: "Checking Account", amount: 95.20 },
                  { title: "Cloud Storage Subscription", category: "Software", date: "Aug 01, 2026", account: "Amex Cash", amount: 19.99 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      {row.title}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline">{row.category}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{row.account}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{row.date}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-rose-500">
                      -{formatCurrency(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
