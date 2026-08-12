import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

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

/** Derive the enum tuple from SUPPORTED_CURRENCIES so adding a new currency
 *  to currencies.ts is the only change needed. */
const currencyCodes = SUPPORTED_CURRENCIES.map((c) => c.code) as [string, ...string[]];

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
  currency: z.enum(currencyCodes as [string, ...string[]], {
    required_error: "Please select a currency",
    invalid_type_error: "Please select a valid currency",
  }),
  account_number_last4: z
    .string()
    .max(4, "Last 4 digits must not exceed 4 characters")
    .optional()
    .nullable(),
  color: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type AccountFormInput = z.infer<typeof accountSchema>;
