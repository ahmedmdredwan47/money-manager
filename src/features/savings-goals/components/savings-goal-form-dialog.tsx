"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  savingsGoalSchema,
  type SavingsGoalFormInput,
} from "../schemas/savings-goal-schema";
import { useCreateSavingsGoal, useUpdateSavingsGoal, SavingsGoalWithCalculations } from "../hooks/use-savings-goals";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { AVAILABLE_CATEGORY_COLORS } from "@/features/categories/schemas/category-schema";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Check } from "lucide-react";

interface SavingsGoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: SavingsGoalWithCalculations | null;
}

export function SavingsGoalFormDialog({
  open,
  onOpenChange,
  goalToEdit,
}: SavingsGoalFormDialogProps) {
  const isEditing = Boolean(goalToEdit);
  const [error, setError] = useState<string | null>(null);

  const { data: accounts } = useAccounts();
  const createGoalMutation = useCreateSavingsGoal();
  const updateGoalMutation = useUpdateSavingsGoal();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalFormInput>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      title: "",
      target_amount: 0,
      current_amount: 0,
      target_date: "",
      account_id: "",
      color: "#10b981",
    },
  });

  const selectedColor = watch("color");

  useEffect(() => {
    if (goalToEdit) {
      reset({
        title: goalToEdit.title,
        target_amount: goalToEdit.target_amount,
        current_amount: goalToEdit.current_amount,
        target_date: goalToEdit.target_date || "",
        account_id: goalToEdit.account_id || "",
        color: goalToEdit.color || "#10b981",
      });
    } else {
      reset({
        title: "",
        target_amount: 0,
        current_amount: 0,
        target_date: "",
        account_id: "",
        color: "#10b981",
      });
    }
    setError(null);
  }, [goalToEdit, open, reset]);

  const onSubmit = async (data: SavingsGoalFormInput) => {
    setError(null);
    try {
      if (isEditing && goalToEdit) {
        await updateGoalMutation.mutateAsync({
          id: goalToEdit.id,
          input: data,
        });
      } else {
        await createGoalMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save savings goal.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Savings Goal" : "Create Savings Goal"}
      description={
        isEditing
          ? "Update goal target, current saved amount, or completion date."
          : "Define a target savings milestone for future financial freedom."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Goal Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Goal Name</label>
          <Input
            {...register("title")}
            placeholder="e.g. Emergency Fund, New Car, House Downpayment"
            className="h-10"
          />
          {errors.title && (
            <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>
          )}
        </div>

        {/* Target & Current Saved Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Target Amount (BDT)</label>
            <Input
              {...register("target_amount")}
              type="number"
              step="any"
              placeholder="e.g. 300000"
              className="h-10 font-mono text-base font-bold"
            />
            {errors.target_amount && (
              <p className="text-xs text-rose-500 font-medium">{errors.target_amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Current Saved (BDT)</label>
            <Input
              {...register("current_amount")}
              type="number"
              step="any"
              placeholder="0"
              className="h-10 font-mono text-base font-bold"
            />
            {errors.current_amount && (
              <p className="text-xs text-rose-500 font-medium">{errors.current_amount.message}</p>
            )}
          </div>
        </div>

        {/* Target Date & Linked Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Expected Completion Date</label>
            <Input
              {...register("target_date")}
              type="date"
              className="h-10 font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Linked Account (Optional)</label>
            <select
              {...register("account_id")}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">None (General Savings)</option>
              {(accounts || []).map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Goal Badge Color</label>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {AVAILABLE_CATEGORY_COLORS.map((colorHex) => {
              const isSelected = selectedColor === colorHex;
              return (
                <button
                  key={colorHex}
                  type="button"
                  onClick={() => setValue("color", colorHex)}
                  className={`h-7 w-7 rounded-full transition-all flex items-center justify-center shrink-0 ${
                    isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: colorHex }}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              );
            })}
          </div>
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
              "Create Goal"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
