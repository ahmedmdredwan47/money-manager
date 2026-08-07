"use client";

import React, { useState } from "react";
import { useSavingsGoals, useDeleteSavingsGoal, SavingsGoalWithCalculations } from "../hooks/use-savings-goals";
import { SavingsGoalCard } from "./savings-goal-card";
import { SavingsGoalCharts } from "./savings-goal-charts";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Target,
  PiggyBank,
  CheckCircle2,
  Plus,
  Loader2,
  Trash2,
  Sparkles,
  Award,
} from "lucide-react";

interface SavingsGoalsListProps {
  onOpenCreateDialog: () => void;
  onEditGoal: (goal: SavingsGoalWithCalculations) => void;
  onDepositGoal: (goal: SavingsGoalWithCalculations) => void;
}

export function SavingsGoalsList({
  onOpenCreateDialog,
  onEditGoal,
  onDepositGoal,
}: SavingsGoalsListProps) {
  const { data: goals, isLoading, isError, error } = useSavingsGoals();
  const deleteGoalMutation = useDeleteSavingsGoal();

  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-6 text-center text-rose-500">
          <p className="font-semibold">Failed to load savings goals</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const goalItems = goals || [];

  // Summary Metrics
  const totalSaved = goalItems.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = goalItems.reduce((s, g) => s + g.target_amount, 0);
  const completedCount = goalItems.filter((g) => g.is_completed).length;
  const avgProgress =
    goalItems.length > 0
      ? goalItems.reduce((s, g) => s + g.percentage, 0) / goalItems.length
      : 0;

  const confirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoalMutation.mutateAsync(goalToDelete);
      setGoalToDelete(null);
    } catch (err) {
      console.error("Delete goal error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Saved
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <PiggyBank className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-500 tracking-tight">
              {formatCurrency(totalSaved, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Accumulated savings balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Target
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(totalTarget, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined milestone target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Progress
            </CardTitle>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {avgProgress.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completion rate across goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Goals
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {completedCount} / {goalItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Milestones fully reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Goal Comparison Chart */}
      {goalItems.length > 0 && <SavingsGoalCharts goals={goalItems} />}

      {/* Goals Grid */}
      {goalItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalItems.map((g) => (
            <SavingsGoalCard
              key={g.id}
              goal={g}
              onEdit={onEditGoal}
              onDeposit={onDepositGoal}
              onDelete={(id) => setGoalToDelete(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center p-8 border-dashed border-border/70">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg font-bold">No Savings Goals Created</CardTitle>
          <CardDescription className="max-w-sm mx-auto mt-1 mb-6">
            Set financial milestones (e.g. Emergency Fund, New Laptop) and track your progress over time.
          </CardDescription>
          <Button variant="gradient" onClick={onOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Create Goal Now
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(goalToDelete)}
        onOpenChange={(open) => !open && setGoalToDelete(null)}
        title="Delete Savings Goal?"
        description="Are you sure you want to delete this savings goal? Any saved record will be removed."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setGoalToDelete(null)}
            disabled={deleteGoalMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteGoalMutation.isPending}
          >
            {deleteGoalMutation.isPending ? (
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
