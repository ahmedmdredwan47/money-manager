import { z } from "zod";

export const budgetSchema = z.object({
  category_id: z.string().min(1, "Please select an expense category"),
  amount_limit: z.coerce
    .number({ invalid_type_error: "Budget limit must be a number" })
    .gt(0, "Budget limit must be greater than 0"),
  month: z.string().min(1, "Please select a month"),
  period: z.enum(["monthly", "yearly"]).default("monthly"),
});

export type BudgetFormInput = z.infer<typeof budgetSchema>;
