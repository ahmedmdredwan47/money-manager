"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Plus, Download, DollarSign, Calendar, Briefcase } from "lucide-react";

export function IncomeView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Streams"
        description="Track and manage all sources of revenue, salary, investments, and side hustles."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button variant="gradient" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Income Entry
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total YTD Income</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(48200.00)}</div>
            <p className="text-xs text-muted-foreground mt-1">+14% compared to last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Monthly</CardTitle>
            <Calendar className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(6885.00)}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on 7 active streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Primary Income Source</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tech Corp Salary</div>
            <p className="text-xs text-emerald-500 mt-1 font-semibold">72% of total revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income History Backbone</CardTitle>
          <CardDescription>Structured list of received income streams</CardDescription>
        </CardHeader>
        <CardContent>
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
                {[
                  { source: "Monthly Salary", category: "Salary", date: "Aug 01, 2026", status: "Cleared", amount: 5200 },
                  { source: "UI/UX Contract", category: "Freelance", date: "Jul 28, 2026", status: "Cleared", amount: 1450 },
                  { source: "Stock Dividends", category: "Investments", date: "Jul 15, 2026", status: "Cleared", amount: 235.50 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      {row.source}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{row.category}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{row.date}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="success">{row.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-500">
                      +{formatCurrency(row.amount)}
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
