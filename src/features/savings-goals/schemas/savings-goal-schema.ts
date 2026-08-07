import { z } from "zod";

export const savingsGoalSchema = z.object({
  title: z
    .string()
    .min(2, "Goal title must be at least 2 characters")
    .max(100, "Goal title must be less than 100 characters"),
  target_amount: z.coerce
    .number({ invalid_type_error: "Target amount must be a number" })
    .gt(0, "Target amount must be greater than 0"),
  current_amount: z.coerce
    .number({ invalid_type_error: "Current amount must be a number" })
    .gte(0, "Current amount cannot be negative")
    .default(0),
  target_date: z.string().optional().nullable(),
  account_id: z.string().optional().nullable(),
  color: z.string().default("#10b981"),
});

export type SavingsGoalFormInput = z.infer<typeof savingsGoalSchema>;

export const depositSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Deposit amount must be a number" })
    .gt(0, "Amount must be greater than 0"),
});

export type DepositFormInput = z.infer<typeof depositSchema>;
