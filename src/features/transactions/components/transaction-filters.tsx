"use client";

import React from "react";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { Input } from "@/components/ui/input";
import { Search, Filter, RotateCcw } from "lucide-react";

interface TransactionFiltersProps {
  type: string;
  onTypeChange: (type: "all" | "income" | "expense" | "transfer") => void;
  accountId: string;
  onAccountChange: (accountId: string) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onResetFilters: () => void;
}

export function TransactionFilters({
  type,
  onTypeChange,
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
}: TransactionFiltersProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const isFiltered = type !== "all" || accountId !== "" || categoryId !== "" || searchQuery !== "";

  return (
    <div className="flex flex-col space-y-3">
      {/* Top row: Type tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-muted/60 border border-border/50">
          {[
            { id: "all", label: "All Entries" },
            { id: "income", label: "Income" },
            { id: "expense", label: "Expenses" },
            { id: "transfer", label: "Transfers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTypeChange(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                type === tab.id
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payee, notes, category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Second row: Account & Category Select Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Account Select Filter */}
        <select
          value={accountId}
          onChange={(e) => onAccountChange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Accounts</option>
          {(accounts || []).map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        {/* Category Select Filter */}
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {(categories || []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.type})
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border/60 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
