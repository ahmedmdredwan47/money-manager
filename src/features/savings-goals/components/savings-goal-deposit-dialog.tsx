"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { depositSchema, type DepositFormInput } from "../schemas/savings-goal-schema";
import { useDepositSavingsGoal, SavingsGoalWithCalculations } from "../hooks/use-savings-goals";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, PiggyBank } from "lucide-react";

interface SavingsGoalDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoalWithCalculations | null;
}

export function SavingsGoalDepositDialog({
  open,
  onOpenChange,
  goal,
}: SavingsGoalDepositDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const depositMutation = useDepositSavingsGoal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormInput>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
    },
  });

  if (!goal) return null;

  const onSubmit = async (data: DepositFormInput) => {
    setError(null);
    try {
      await depositMutation.mutateAsync({
        id: goal.id,
        depositAmount: data.amount,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to add funds.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Add Funds: ${goal.title}`}
      description="Deposit money toward this savings goal milestone."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Goal Target:</span>
            <span className="font-mono font-bold text-foreground">
              BDT {goal.target_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Currently Saved:</span>
            <span className="font-mono font-bold text-emerald-500">
              BDT {goal.current_amount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Deposit Amount (BDT)</label>
          <Input
            {...register("amount")}
            type="number"
            step="any"
            placeholder="e.g. 5000"
            className="h-10 font-mono text-base font-bold"
          />
          {errors.amount && (
            <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>
          )}
        </div>

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
            ) : (
              <PiggyBank className="mr-2 h-4 w-4" />
            )}
            Add Funds Now
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
