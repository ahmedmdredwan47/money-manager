"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../hooks/use-dashboard";
import { DashboardKpiGrid } from "./dashboard-kpi-grid";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardTopCategories } from "./dashboard-top-categories";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { Plus, ArrowLeftRight } from "lucide-react";

export function DashboardView() {
  const {
    isLoading,
    currentBalance,
    usingFallbackRates,
    hasUnavailableRates,
    ratesFetchedAt,
    todaysExpense,
    thisMonthIncome,
    thisMonthExpense,
    monthlySavings,
    savingsRate,
    recentTransactions,
    categoryBreakdownData,
    topCategories,
    monthlyTrendData,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-80 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Dashboard"
        description="Real-time financial analytics, total net worth, cash flow trends, and category expenditure."
        action={
          <div className="flex items-center gap-2">
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                <ArrowLeftRight className="mr-2 h-4 w-4" /> Ledger
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="gradient" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Log Entry
              </Button>
            </Link>
          </div>
        }
      />

      {/* 1. 5 KPI Stat Cards */}
      <DashboardKpiGrid
        currentBalance={currentBalance}
        usingFallbackRates={usingFallbackRates}
        hasUnavailableRates={hasUnavailableRates}
        ratesFetchedAt={ratesFetchedAt}
        todaysExpense={todaysExpense}
        thisMonthIncome={thisMonthIncome}
        thisMonthExpense={thisMonthExpense}
        monthlySavings={monthlySavings}
        savingsRate={savingsRate}
      />

      {/* 2. Recharts Area & Donut Pie Charts */}
      <DashboardCharts
        monthlyTrendData={monthlyTrendData}
        categoryBreakdownData={categoryBreakdownData}
      />

      {/* 3. Top Categories & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardTopCategories topCategories={topCategories} />
        <DashboardRecentActivity recentTransactions={recentTransactions} />
      </div>
    </div>
  );
}
