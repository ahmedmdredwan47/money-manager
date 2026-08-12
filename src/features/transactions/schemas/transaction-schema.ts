import { z } from "zod";

export const transactionTypes = ["income", "expense", "transfer"] as const;
export type TransactionTypeEnum = (typeof transactionTypes)[number];

export const transactionTypeLabels: Record<TransactionTypeEnum, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

export const transactionStatuses = ["pending", "cleared", "reconciled"] as const;
export type TransactionStatusEnum = (typeof transactionStatuses)[number];

export const transactionSchema = z
  .object({
    type: z.enum(transactionTypes, {
      required_error: "Please select a transaction type",
    }),
    amount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .gt(0, "Amount must be greater than 0"),
    currency: z.string().default("BDT"),
    account_id: z.string().min(1, "Please select an account"),
    category_id: z.string().optional().nullable(),
    transfer_account_id: z.string().optional().nullable(),
    date: z.string().min(1, "Please select a date"),
    payee_merchant: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.enum(transactionStatuses).default("cleared"),
    crypto_asset_id: z.string().optional().nullable(),
    crypto_quantity: z.string().optional().nullable(),
    crypto_code: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "transfer") {
        return Boolean(data.transfer_account_id);
      }
      return true;
    },
    {
      message: "Please select a destination account for transfers",
      path: ["transfer_account_id"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "transfer" && data.transfer_account_id) {
        return data.account_id !== data.transfer_account_id;
      }
      return true;
    },
    {
      message: "Source and destination accounts must be different",
      path: ["transfer_account_id"],
    }
  );

export type TransactionFormInput = z.infer<typeof transactionSchema>;
