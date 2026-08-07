"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, Receipt, Calculator } from "lucide-react";

interface ReportsKpiBannerProps {
  summaryStats: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    totalCount: number;
    avgTxSize: number;
  };
}

export function ReportsKpiBanner({ summaryStats }: ReportsKpiBannerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Income */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Income
          </CardTitle>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-mono text-emerald-500 tracking-tight">
            +{formatCurrency(summaryStats.totalIncome, "BDT")}
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Expense */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Expenses
          </CardTitle>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <TrendingDown className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-mono text-rose-500 tracking-tight">
            -{formatCurrency(summaryStats.totalExpense, "BDT")}
          </div>
        </CardContent>
      </Card>

      {/* 3. Net Savings */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Net Savings
          </CardTitle>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <PiggyBank className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-xl font-bold font-mono tracking-tight ${
              summaryStats.netSavings < 0 ? "text-rose-500" : "text-emerald-500"
            }`}
          >
            {summaryStats.netSavings >= 0 ? "+" : ""}
            {formatCurrency(summaryStats.netSavings, "BDT")}
          </div>
        </CardContent>
      </Card>

      {/* 4. Avg Transaction */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Entry Size
          </CardTitle>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
            <Calculator className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-mono text-foreground tracking-tight">
            {formatCurrency(summaryStats.avgTxSize, "BDT")}
          </div>
        </CardContent>
      </Card>

      {/* 5. Total Count */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ledger Entries
          </CardTitle>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Receipt className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-mono text-foreground tracking-tight">
            {summaryStats.totalCount} records
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
