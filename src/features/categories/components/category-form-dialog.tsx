"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  categoryTypes,
  categoryTypeLabels,
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_CATEGORY_COLORS,
  type CategoryFormInput,
  type CategoryTypeEnum,
} from "../schemas/category-schema";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-categories";
import { Category } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  Loader2,
  Check,
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

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  categoryToEdit,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(categoryToEdit);
  const [error, setError] = useState<string | null>(null);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "expense",
      icon: "Tag",
      color: "#3b82f6",
    },
  });

  const selectedType = watch("type");
  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        type: categoryToEdit.type as CategoryTypeEnum,
        icon: categoryToEdit.icon || "Tag",
        color: categoryToEdit.color || "#3b82f6",
      });
    } else {
      reset({
        name: "",
        type: "expense",
        icon: "Tag",
        color: "#3b82f6",
      });
    }
    setError(null);
  }, [categoryToEdit, open, reset]);

  const onSubmit = async (data: CategoryFormInput) => {
    setError(null);
    try {
      if (isEditing && categoryToEdit) {
        await updateCategoryMutation.mutateAsync({
          id: categoryToEdit.id,
          input: data,
        });
      } else {
        await createCategoryMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save category details.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Category" : "Create New Category"}
      description={
        isEditing
          ? "Update category name, icon, type, or color scheme."
          : "Add a custom income, expense, or transfer category tag."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Category Type</label>
          <div className="grid grid-cols-3 gap-2">
            {categoryTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue("type", t, { shouldValidate: true })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedType === t
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-border/60 hover:border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                {categoryTypeLabels[t]}
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="text-xs text-rose-500 font-medium">{errors.type.message}</p>
          )}
        </div>

        {/* Category Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Category Name</label>
          <Input
            {...register("name")}
            placeholder="e.g. Subscriptions, Side Hustle, Pet Care"
            className="h-10"
          />
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Icon Palette Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Select Icon</label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl border border-border/50 bg-muted/20 scrollbar-none">
            {AVAILABLE_CATEGORY_ICONS.map((iconKey) => {
              const IconComp = ICON_MAP[iconKey] || Tag;
              const isSelected = selectedIcon === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setValue("icon", iconKey)}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  title={iconKey}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Swatch Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Select Color Token</label>
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
              "Create Category"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
