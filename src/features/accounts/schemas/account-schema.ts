import { z } from "zod";

export const accountTypes = [
  "bank",
  "cash",
  "bkash",
  "nagad",
  "rocket",
  "card",
  "checking",
  "savings",
  "credit_card",
  "investment",
  "loan",
  "other",
] as const;

export type AccountTypeEnum = (typeof accountTypes)[number];

export const accountTypeLabels: Record<AccountTypeEnum, string> = {
  bank: "Bank Account",
  cash: "Cash / Wallet",
  bkash: "bKash (MFS)",
  nagad: "Nagad (MFS)",
  rocket: "DBBL Rocket",
  card: "Credit / Debit Card",
  checking: "Checking Account",
  savings: "Savings Account",
  credit_card: "Credit Card",
  investment: "Investment Account",
  loan: "Loan Account",
  other: "Other Financial Account",
};

export const accountSchema = z.object({
  name: z
    .string()
    .min(2, "Account name must be at least 2 characters")
    .max(50, "Account name must be less than 50 characters"),
  type: z.enum(accountTypes, {
    required_error: "Please select an account type",
  }),
  balance: z.coerce.number({
    invalid_type_error: "Please enter a valid initial balance",
  }),
  currency: z
    .string()
    .min(1, "Currency code is required")
    .max(5, "Currency code must be 5 characters or fewer"),
  account_number_last4: z
    .string()
    .max(4, "Last 4 digits must not exceed 4 characters")
    .optional()
    .nullable(),
  color: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type AccountFormInput = z.infer<typeof accountSchema>;
