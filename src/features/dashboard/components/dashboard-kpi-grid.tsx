"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Calendar, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardKpiGridProps {
  currentBalance: number;
  todaysExpense: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  monthlySavings: number;
  savingsRate: number;
}

export function DashboardKpiGrid({
  currentBalance,
  todaysExpense,
  thisMonthIncome,
  thisMonthExpense,
  monthlySavings,
  savingsRate,
}: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Current Balance */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current Balance
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Wallet className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
            {formatCurrency(currentBalance, "BDT")}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-500 font-medium">
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            <span className="font-semibold">+12.4%</span>
            <span className="ml-1 text-muted-foreground">vs last month</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Today's Expense */}
      <Card className="relative overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Today&apos;s Expense
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
            <Calendar className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-rose-500 tracking-tight">
            -{formatCurrency(todaysExpense, "BDT")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Log entries dated today</p>
        </CardContent>
      </Card>

      {/* 3. This Month Income */}
      <Card className="relative overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            This Month Income
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-emerald-500 tracking-tight">
            +{formatCurrency(thisMonthIncome, "BDT")}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-500 font-medium">
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            <span className="font-semibold">+8.2%</span>
            <span className="ml-1 text-muted-foreground">monthly influx</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. This Month Expense */}
      <Card className="relative overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            This Month Expense
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <TrendingDown className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-rose-500 tracking-tight">
            -{formatCurrency(thisMonthExpense, "BDT")}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-500 font-medium">
            <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
            <span className="font-semibold">-3.1%</span>
            <span className="ml-1 text-muted-foreground">spending control</span>
          </div>
        </CardContent>
      </Card>

      {/* 5. Savings */}
      <Card className="relative overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Monthly Savings
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <PiggyBank className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold font-mono tracking-tight ${
              monthlySavings < 0 ? "text-rose-500" : "text-foreground"
            }`}
          >
            {formatCurrency(monthlySavings, "BDT")}
          </div>
          <p className="text-xs text-emerald-500 font-semibold mt-2">
            {savingsRate.toFixed(1)}% savings rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
