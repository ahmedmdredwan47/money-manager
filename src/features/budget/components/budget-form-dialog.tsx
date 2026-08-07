"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, type BudgetFormInput } from "../schemas/budget-schema";
import { useCreateBudget, useUpdateBudget, BudgetWithCalculations } from "../hooks/use-budgets";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: BudgetWithCalculations | null;
  defaultMonth?: string;
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  budgetToEdit,
  defaultMonth,
}: BudgetFormDialogProps) {
  const isEditing = Boolean(budgetToEdit);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();

  const currentMonthStr = defaultMonth || new Date().toISOString().slice(0, 7);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: "",
      amount_limit: 0,
      month: currentMonthStr,
      period: "monthly",
    },
  });

  useEffect(() => {
    if (budgetToEdit) {
      const monthFromStartDate = budgetToEdit.start_date
        ? budgetToEdit.start_date.slice(0, 7)
        : currentMonthStr;
      reset({
        category_id: budgetToEdit.category_id,
        amount_limit: budgetToEdit.amount_limit,
        month: monthFromStartDate,
        period: (budgetToEdit.period as any) || "monthly",
      });
    } else {
      reset({
        category_id: "",
        amount_limit: 0,
        month: currentMonthStr,
        period: "monthly",
      });
    }
    setError(null);
  }, [budgetToEdit, open, reset, currentMonthStr]);

  // Filter only expense categories
  const expenseCategories = (categories || []).filter((c) => c.type === "expense");

  const onSubmit = async (data: BudgetFormInput) => {
    setError(null);
    try {
      if (isEditing && budgetToEdit) {
        await updateBudgetMutation.mutateAsync({
          id: budgetToEdit.id,
          input: data,
        });
      } else {
        await createBudgetMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save budget limit.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Monthly Budget" : "Set New Budget Limit"}
      description={
        isEditing
          ? "Update monthly spending limit for this expense category."
          : "Define a monthly spending cap to keep your expenses in check."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Expense Category Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Expense Category</label>
          <select
            {...register("category_id")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select Expense Category</option>
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-xs text-rose-500 font-medium">{errors.category_id.message}</p>
          )}
        </div>

        {/* Amount Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Monthly Limit Amount (BDT)</label>
          <Input
            {...register("amount_limit")}
            type="number"
            step="any"
            placeholder="e.g. 15000"
            className="h-10 font-mono text-base font-bold"
          />
          {errors.amount_limit && (
            <p className="text-xs text-rose-500 font-medium">{errors.amount_limit.message}</p>
          )}
        </div>

        {/* Target Month Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Target Month</label>
          <Input
            {...register("month")}
            type="month"
            className="h-10 font-mono text-sm"
          />
          {errors.month && (
            <p className="text-xs text-rose-500 font-medium">{errors.month.message}</p>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={isSubmitting}
            className="font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Set Budget Limit"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
