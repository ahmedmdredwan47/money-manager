"use client";

import React from "react";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CalendarDays,
  Tags,
  Download,
  FileSpreadsheet,
  Printer,
  Filter,
} from "lucide-react";

interface ReportsFiltersProps {
  periodMode: "monthly" | "yearly" | "category";
  onPeriodModeChange: (mode: "monthly" | "yearly" | "category") => void;
  typeFilter: "all" | "income" | "expense";
  onTypeFilterChange: (type: "all" | "income" | "expense") => void;
  year: number;
  onYearChange: (year: number) => void;
  month: number;
  onMonthChange: (month: number) => void;
  accountId: string;
  onAccountChange: (accId: string) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function ReportsFilters({
  periodMode,
  onPeriodModeChange,
  typeFilter,
  onTypeFilterChange,
  year,
  onYearChange,
  month,
  onMonthChange,
  accountId,
  onAccountChange,
  onExportCSV,
  onExportExcel,
  onExportPDF,
}: ReportsFiltersProps) {
  const { data: accounts } = useAccounts();

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-4 print:hidden">
      {/* Mode Tabs & Export Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Period Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 overflow-x-auto">
          {[
            { id: "monthly", label: "Monthly Report", icon: Calendar },
            { id: "yearly", label: "Yearly Report", icon: CalendarDays },
            { id: "category", label: "Category Breakdown", icon: Tags },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = periodMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onPeriodModeChange(tab.id as any)}
                className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportExcel} className="text-xs">
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Excel
          </Button>
          <Button variant="gradient" size="sm" onClick={onExportPDF} className="text-xs font-semibold">
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border/40 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-muted-foreground mr-2">
          <Filter className="h-3.5 w-3.5" />
          <span>Report Filters:</span>
        </div>

        {/* Type Filter Select */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as any)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Types (Income & Expenses)</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        {/* Year Select */}
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="h-8 rounded-lg border border-input bg-background px-2.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>

        {/* Month Select (visible in Monthly mode) */}
        {periodMode === "monthly" && (
          <select
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-input bg-background px-2.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {monthNames.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        )}

        {/* Account Filter Select */}
        <select
          value={accountId}
          onChange={(e) => onAccountChange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Accounts</option>
          {(accounts || []).map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
