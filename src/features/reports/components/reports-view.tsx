"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { useReports } from "../hooks/use-reports";
import { ReportsFilters } from "./reports-filters";
import { ReportsKpiBanner } from "./reports-kpi-banner";
import { ReportsCharts } from "./reports-charts";
import { ReportsTable } from "./reports-table";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/export-reports";

export function ReportsView() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [periodMode, setPeriodMode] = useState<"monthly" | "yearly" | "category">("monthly");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [accountId, setAccountId] = useState<string>("");

  const {
    isLoading,
    summaryStats,
    chartSeries,
    categoryBreakdown,
    filteredTransactions,
  } = useReports({
    periodMode,
    typeFilter,
    year,
    month,
    accountId,
  });

  const handleExportCSV = () => {
    exportToCSV(`wealthwise-financial-report-${periodMode}-${year}`, filteredTransactions);
  };

  const handleExportExcel = () => {
    exportToExcel(`wealthwise-financial-report-${periodMode}-${year}`, filteredTransactions);
  };

  const handleExportPDF = () => {
    exportToPDF();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-full rounded-2xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-80 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="print:hidden">
        <PageHeader
          title="Financial Reports & Analytics"
          description="In-depth financial analysis, trend charts, category distributions, and downloadable statements."
        />
      </div>

      {/* Print PDF Document Header (Visible only during printing) */}
      <div className="hidden print:block border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">WealthWise Financial Statement Report</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Period: {periodMode.toUpperCase()} | Generated Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Filters & Export Toolbar */}
      <ReportsFilters
        periodMode={periodMode}
        onPeriodModeChange={setPeriodMode}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        year={year}
        onYearChange={setYear}
        month={month}
        onMonthChange={setMonth}
        accountId={accountId}
        onAccountChange={setAccountId}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {/* KPI Summary Banner */}
      <ReportsKpiBanner summaryStats={summaryStats} />

      {/* Recharts Visualizations */}
      <ReportsCharts
        periodMode={periodMode}
        chartSeries={chartSeries}
        categoryBreakdown={categoryBreakdown}
      />

      {/* Category Rankings & Ledger Table */}
      <ReportsTable
        categoryBreakdown={categoryBreakdown}
        transactions={filteredTransactions}
      />
    </div>
  );
}
