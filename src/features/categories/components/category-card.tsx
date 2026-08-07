"use client";

import React from "react";
import { Category } from "@/types";
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
  Lock,
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

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const IconComp = ICON_MAP[category.icon || "Tag"] || Tag;
  const categoryColor = category.color || "#3b82f6";

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "income":
        return <Badge variant="success">Income</Badge>;
      case "expense":
        return <Badge variant="destructive">Expense</Badge>;
      default:
        return <Badge variant="outline">Transfer</Badge>;
    }
  };

  return (
    <Card className="hover:border-border/80 transition-all shadow-sm group">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-sm text-white"
            style={{ backgroundColor: categoryColor }}
          >
            <IconComp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm leading-none">{category.name}</p>
              {category.is_system && (
                <span title="System Category (Default)">
                  <Lock className="h-3 w-3 text-muted-foreground/60" />
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {getTypeBadge(category.type)}
              <span className="text-[11px] text-muted-foreground">
                {category.is_system ? "System Default" : "Custom Tag"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        {!category.is_system ? (
          <DropdownMenu
            trigger={
              <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Category Options</span>
              </button>
            }
          >
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <span>Edit Category</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              className="text-rose-500 focus:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Category</span>
            </DropdownMenuItem>
          </DropdownMenu>
        ) : (
          <div className="h-8 w-8" />
        )}
      </CardContent>
    </Card>
  );
}
