import { z } from "zod";

export const categoryTypes = ["expense", "income", "transfer"] as const;
export type CategoryTypeEnum = (typeof categoryTypes)[number];

export const categoryTypeLabels: Record<CategoryTypeEnum, string> = {
  expense: "Expense",
  income: "Income",
  transfer: "Transfer",
};

export const AVAILABLE_CATEGORY_ICONS = [
  "Home",
  "Utensils",
  "Car",
  "ShoppingBag",
  "Film",
  "HeartPulse",
  "Briefcase",
  "Landmark",
  "Zap",
  "GraduationCap",
  "Plane",
  "Gift",
  "DollarSign",
  "ArrowLeftRight",
  "Tag",
  "Smartphone",
  "ShieldCheck",
  "Coffee",
  "Smile",
  "Wrench",
];

export const AVAILABLE_CATEGORY_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters"),
  type: z.enum(categoryTypes, {
    required_error: "Please select a category type",
  }),
  icon: z.string().default("Tag"),
  color: z.string().default("#3b82f6"),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;
