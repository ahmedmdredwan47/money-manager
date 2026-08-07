"use client";

import React, { useState } from "react";
import { useBudgets, useDeleteBudget, BudgetWithCalculations } from "../hooks/use-budgets";
import { BudgetCard } from "./budget-card";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  PieChart,
  TrendingDown,
  PiggyBank,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface BudgetListProps {
  onOpenCreateDialog: () => void;
  onEditBudget: (budget: BudgetWithCalculations) => void;
}

export function BudgetList({
  onOpenCreateDialog,
  onEditBudget,
}: BudgetListProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );

  const { data: budgets, isLoading, isError, error } = useBudgets(selectedMonth);
  const deleteBudgetMutation = useDeleteBudget();

  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const d = new Date(year, month - 2, 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const d = new Date(year, month, 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full rounded-2xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-6 text-center text-rose-500">
          <p className="font-semibold">Failed to load budgets</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const budgetItems = budgets || [];

  // KPI calculations
  const totalBudgeted = budgetItems.reduce((s, b) => s + b.amount_limit, 0);
  const totalSpent = budgetItems.reduce((s, b) => s + b.actual_spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallHealthRate =
    totalBudgeted > 0 ? Math.max(0, ((totalBudgeted - totalSpent) / totalBudgeted) * 100) : 100;

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await deleteBudgetMutation.mutateAsync(budgetToDelete);
      setBudgetToDelete(null);
    } catch (err) {
      console.error("Delete budget error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8 font-mono text-xs font-semibold w-36 text-center"
          />
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Tracking budget limits for <span className="font-bold text-foreground">{selectedMonth}</span>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Budgeted
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <PieChart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(totalBudgeted, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total limit set for month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actual Spent
            </CardTitle>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-500 tracking-tight">
              {formatCurrency(totalSpent, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Remaining Cap
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <PiggyBank className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold font-mono tracking-tight ${
                totalRemaining < 0 ? "text-rose-500" : "text-emerald-500"
              }`}
            >
              {formatCurrency(totalRemaining, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unspent monthly funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget Health
            </CardTitle>
            <div
              className={`p-2 rounded-xl ${
                overallHealthRate < 20
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-teal-500/10 text-teal-500"
              }`}
            >
              {overallHealthRate < 20 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {overallHealthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall cap headroom</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards Grid */}
      {budgetItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetItems.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={onEditBudget}
              onDelete={(id) => setBudgetToDelete(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center p-8 border-dashed border-border/70">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg font-bold">No Monthly Budgets Set</CardTitle>
          <CardDescription className="max-w-sm mx-auto mt-1 mb-6">
            Set spending limits for your expense categories to prevent overspending and reach your savings targets.
          </CardDescription>
          <Button variant="gradient" onClick={onOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Set Budget Limit Now
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(budgetToDelete)}
        onOpenChange={(open) => !open && setBudgetToDelete(null)}
        title="Delete Budget Limit?"
        description="Are you sure you want to remove this monthly spending cap? Existing transactions will not be affected."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setBudgetToDelete(null)}
            disabled={deleteBudgetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteBudgetMutation.isPending}
          >
            {deleteBudgetMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Confirm Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
