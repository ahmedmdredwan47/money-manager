"use client";

import React from "react";
import { BudgetWithCalculations } from "../hooks/use-budgets";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Briefcase,
  Landmark,
  Zap,
  GraduationCap,
  Plane,
  Gift,
  DollarSign,
  ArrowLeftRight,
  Tag,
  Smartphone,
  ShieldCheck,
  Coffee,
  Smile,
  Wrench,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Briefcase,
  Landmark,
  Zap,
  GraduationCap,
  Plane,
  Gift,
  DollarSign,
  ArrowLeftRight,
  Tag,
  Smartphone,
  ShieldCheck,
  Coffee,
  Smile,
  Wrench,
};

interface BudgetCardProps {
  budget: BudgetWithCalculations;
  onEdit: (budget: BudgetWithCalculations) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const IconComp = ICON_MAP[budget.category?.icon || "Tag"] || Tag;
  const categoryColor = budget.category?.color || "#3b82f6";

  const { percentage_used, is_warning, is_exceeded } = budget;

  // Determine progress bar color theme
  const getProgressColorClass = () => {
    if (is_exceeded) return "bg-rose-500";
    if (is_warning) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Card className="hover:border-border/80 transition-all shadow-sm group relative overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header: Icon, Category Name, Badges & Action */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-sm text-white"
              style={{ backgroundColor: categoryColor }}
            >
              <IconComp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm leading-none">{budget.category?.name || "Category Budget"}</p>
                {is_exceeded && (
                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> Exceeded
                  </Badge>
                )}
                {is_warning && !is_exceeded && (
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Near Limit
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Limit: {formatCurrency(budget.amount_limit, "BDT")}
              </p>
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu
            trigger={
              <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Budget Options</span>
              </button>
            }
          >
            <DropdownMenuItem onClick={() => onEdit(budget)}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <span>Edit Limit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(budget.id)}
              className="text-rose-500 focus:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Budget</span>
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Spent: {formatCurrency(budget.actual_spent, "BDT")}</span>
            <span className={is_exceeded ? "text-rose-500 font-bold" : is_warning ? "text-amber-500 font-bold" : "text-emerald-500"}>
              {percentage_used.toFixed(1)}%
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColorClass()}`}
              style={{ width: `${Math.min(percentage_used, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer: Remaining Balance */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
          <span className="text-muted-foreground font-medium">Remaining Balance:</span>
          <span
            className={`font-mono font-bold ${
              budget.remaining_balance < 0 ? "text-rose-500" : "text-emerald-500"
            }`}
          >
            {budget.remaining_balance < 0 ? "-" : "+"}
            {formatCurrency(Math.abs(budget.remaining_balance), "BDT")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
