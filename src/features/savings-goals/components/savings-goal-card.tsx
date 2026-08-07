"use client";

import React from "react";
import { SavingsGoalWithCalculations } from "../hooks/use-savings-goals";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  CheckCircle2,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

interface SavingsGoalCardProps {
  goal: SavingsGoalWithCalculations;
  onEdit: (goal: SavingsGoalWithCalculations) => void;
  onDeposit: (goal: SavingsGoalWithCalculations) => void;
  onDelete: (id: string) => void;
}

export function SavingsGoalCard({
  goal,
  onEdit,
  onDeposit,
  onDelete,
}: SavingsGoalCardProps) {
  const goalColor = goal.color || "#10b981";
  const { percentage, remaining_amount, months_left, monthly_pace, is_completed } = goal;

  return (
    <Card className="hover:border-border/80 transition-all shadow-sm group relative overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-sm text-white"
              style={{ backgroundColor: goalColor }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm leading-none">{goal.title}</p>
                {is_completed && (
                  <Badge variant="success" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Reached
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Target: {formatCurrency(goal.target_amount, "BDT")}
              </p>
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu
            trigger={
              <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Goal Options</span>
              </button>
            }
          >
            <DropdownMenuItem onClick={() => onDeposit(goal)}>
              <PlusCircle className="h-4 w-4 text-emerald-500" />
              <span>Add / Deposit Funds</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(goal)}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <span>Edit Goal</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(goal.id)}
              className="text-rose-500 focus:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Goal</span>
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        {/* Progress Bar & Saved Amount */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Saved: {formatCurrency(goal.current_amount, "BDT")}</span>
            <span className="text-emerald-500 font-mono font-bold">{percentage.toFixed(1)}%</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: goalColor,
              }}
            />
          </div>
        </div>

        {/* Completion Date & Required Monthly Pace */}
        <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
          {goal.target_date && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Target Date:
              </span>
              <span className="font-mono font-semibold text-foreground">{goal.target_date}</span>
            </div>
          )}

          {!is_completed && monthly_pace !== null && monthly_pace > 0 && (
            <div className="flex items-center justify-between text-emerald-500 font-medium">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Required Pace:
              </span>
              <span className="font-mono font-bold">
                {formatCurrency(monthly_pace, "BDT")}/mo ({months_left}m left)
              </span>
            </div>
          )}
        </div>

        {/* Deposit Button */}
        {!is_completed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeposit(goal)}
            className="w-full mt-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-xs"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Funds
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
