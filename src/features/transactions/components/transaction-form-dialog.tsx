"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  transactionTypes,
  transactionTypeLabels,
  type TransactionFormInput,
  type TransactionTypeEnum,
} from "../schemas/transaction-schema";
import { useCreateTransaction, useUpdateTransaction } from "../hooks/use-transactions";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useCryptoHoldings } from "@/features/crypto-holdings/hooks/use-crypto-holdings";
import { useCryptoAssets } from "@/features/crypto-holdings/hooks/use-crypto-assets";
import { compareDecimalStrings } from "@/lib/crypto-valuation";
import { formatCryptoQuantity } from "@/features/crypto-holdings/utils";
import { TransactionWithCategoryAndAccount } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: TransactionWithCategoryAndAccount | null;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transactionToEdit,
}: TransactionFormDialogProps) {
  const isEditing = Boolean(transactionToEdit);
  const [error, setError] = useState<string | null>(null);

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: cryptoHoldings = [] } = useCryptoHoldings();
  const { data: cryptoAssets = [] } = useCryptoAssets();

  const createTxMutation = useCreateTransaction();
  const updateTxMutation = useUpdateTransaction();

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      currency: "BDT",
      account_id: "",
      category_id: "",
      transfer_account_id: "",
      date: today,
      payee_merchant: "",
      description: "",
      status: "cleared",
    },
  });

  const selectedType = watch("type");
  const selectedAccountId = watch("account_id");
  const [cryptoQuantity, setCryptoQuantity] = useState("");
  const selectedCryptoHolding = cryptoHoldings.find((holding) => holding.account_id === selectedAccountId);
  const selectedCryptoAsset = selectedCryptoHolding
    ? cryptoAssets.find((asset) => asset.id === selectedCryptoHolding.crypto_asset_id)
    : undefined;
  const isCryptoAccount = Boolean(selectedCryptoHolding && selectedCryptoAsset);
  const isCryptoTransaction = Boolean(transactionToEdit?.crypto_quantity);

  // Auto-sync transaction currency with selected account's currency
  useEffect(() => {
    if (!transactionToEdit && selectedAccountId && accounts) {
      const acc = accounts.find((a) => a.id === selectedAccountId);
      if (acc && acc.currency) {
        setValue("currency", acc.currency);
      }
    }
  }, [selectedAccountId, accounts, setValue, transactionToEdit]);

  useEffect(() => {
    if (isCryptoAccount) {
      // Amount remains a required legacy monetary field; the mutation replaces
      // it with the price-derived BDT valuation while retaining the quantity.
      setValue("amount", 1);
      setValue("currency", "BDT");
    }
  }, [isCryptoAccount, setValue]);

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        type: transactionToEdit.type as TransactionTypeEnum,
        amount: transactionToEdit.amount,
        currency: transactionToEdit.currency || transactionToEdit.account?.currency || "BDT",
        account_id: transactionToEdit.account_id,
        category_id: transactionToEdit.category_id || "",
        transfer_account_id: transactionToEdit.transfer_account_id || "",
        date: transactionToEdit.date,
        payee_merchant: transactionToEdit.payee_merchant || "",
        description: transactionToEdit.description || "",
        status: transactionToEdit.status as any,
      });
    } else {
      const initialAcc = accounts && accounts.length > 0 ? accounts[0] : null;
      reset({
        type: "expense",
        amount: 0,
        currency: initialAcc?.currency || "BDT",
        account_id: initialAcc?.id || "",
        category_id: "",
        transfer_account_id: "",
        date: today,
        payee_merchant: "",
        description: "",
        status: "cleared",
      });
    }
    setError(null);
  }, [transactionToEdit, open, reset, accounts, today]);

  // Filter available categories based on selected type
  const availableCategories = (categories || []).filter(
    (c) => c.type === selectedType
  );

  const onSubmit = async (data: TransactionFormInput) => {
    setError(null);
    try {
      if (isCryptoTransaction) throw new Error("Crypto transactions are immutable to preserve the recorded holding movement.");
      if (isCryptoAccount) {
        if (!/^\d+(?:\.\d+)?$/.test(cryptoQuantity) || /^0(?:\.0+)?$/.test(cryptoQuantity)) {
          throw new Error("Enter a positive cryptocurrency quantity using decimal notation.");
        }
        if (data.type === "transfer") throw new Error("Crypto transfers are not supported yet. Choose Add Crypto or Remove / Sell Crypto.");
        if (data.type === "expense" && compareDecimalStrings(cryptoQuantity, selectedCryptoHolding!.quantity) > 0) {
          throw new Error(`Cannot remove more than your ${formatCryptoQuantity(selectedCryptoHolding!.quantity)} ${selectedCryptoAsset!.code} holding.`);
        }
        data = { ...data, crypto_asset_id: selectedCryptoAsset!.id, crypto_quantity: cryptoQuantity, crypto_code: selectedCryptoAsset!.code };
      }
      if (isEditing && transactionToEdit) {
        await updateTxMutation.mutateAsync({
          id: transactionToEdit.id,
          input: data,
        });
      } else {
        await createTxMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save transaction.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Transaction" : "New Transaction Entry"}
      description={
        isEditing
          ? "Update details, amount, category, or account attachment."
          : "Log a new Income, Expense, Account Transfer, or crypto holding entry."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Type Tabs Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Entry Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "expense", label: isCryptoAccount ? "Remove / Sell" : "Expense", icon: TrendingDown, color: "text-rose-500" },
              { id: "income", label: isCryptoAccount ? "Add Crypto" : "Income", icon: TrendingUp, color: "text-emerald-500" },
              { id: "transfer", label: "Transfer", icon: ArrowRightLeft, color: "text-blue-500" },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setValue("type", t.id as any, { shouldValidate: true })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${t.color}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="text-xs text-rose-500 font-medium">{errors.type.message}</p>
          )}
        </div>

        {/* Amount & Currency */}
        {isCryptoAccount ? <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-2">
          <div className="flex items-center justify-between"><label className="text-xs font-semibold text-muted-foreground">{selectedType === "expense" ? "Quantity to remove / sell" : "Quantity to add"}</label><span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{selectedCryptoAsset!.name} ({selectedCryptoAsset!.code})</span></div>
          <Input value={cryptoQuantity} onChange={(event) => setCryptoQuantity(event.target.value)} inputMode="decimal" placeholder="0.00000001" className="h-10 font-mono text-base font-bold" />
          <p className="text-[11px] text-muted-foreground">Current holding: <span className="font-mono font-semibold">{formatCryptoQuantity(selectedCryptoHolding!.quantity)} {selectedCryptoAsset!.code}</span>. BDT value is captured at transaction time.</p>
        </div> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Amount</label>
            <Input
              {...register("amount")}
              type="number"
              step="any"
              placeholder="0.00"
              className="h-10 font-mono text-base font-bold"
            />
            {errors.amount && (
              <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Currency</label>
            <Input
              {...register("currency")}
              placeholder="BDT"
              className="h-10 uppercase"
            />
            {errors.currency && (
              <p className="text-xs text-rose-500 font-medium">{errors.currency.message}</p>
            )}
          </div>
        </div>}

        {/* Account Selection */}
        {selectedType === "transfer" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">From Account (Source)</label>
              <select
                {...register("account_id")}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Source Account</option>
                {(accounts || []).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({cryptoAssets.find((asset) => asset.id === cryptoHoldings.find((holding) => holding.account_id === acc.id)?.crypto_asset_id)?.code || acc.currency || "BDT"})
                  </option>
                ))}
              </select>
              {errors.account_id && (
                <p className="text-xs text-rose-500 font-medium">{errors.account_id.message}</p>
              )}
            </div>

            {/* Destination Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">To Account (Destination)</label>
              <select
                {...register("transfer_account_id")}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Destination Account</option>
                {(accounts || []).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({cryptoAssets.find((asset) => asset.id === cryptoHoldings.find((holding) => holding.account_id === acc.id)?.crypto_asset_id)?.code || acc.currency || "BDT"})
                  </option>
                ))}
              </select>
              {errors.transfer_account_id && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.transfer_account_id.message}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account attachment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Account</label>
              <select
                {...register("account_id")}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Account</option>
                {(accounts || []).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({cryptoAssets.find((asset) => asset.id === cryptoHoldings.find((holding) => holding.account_id === acc.id)?.crypto_asset_id)?.code || acc.currency || "BDT"})
                  </option>
                ))}
              </select>
              {errors.account_id && (
                <p className="text-xs text-rose-500 font-medium">{errors.account_id.message}</p>
              )}
            </div>

            {/* Category attachment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select
                {...register("category_id")}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-rose-500 font-medium">{errors.category_id.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Date & Payee/Merchant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Date</label>
            <Input
              {...register("date")}
              type="date"
              className="h-10 font-mono"
            />
            {errors.date && (
              <p className="text-xs text-rose-500 font-medium">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Payee / Merchant</label>
            <Input
              {...register("payee_merchant")}
              placeholder="e.g. Unimart, Uber, Tech Corp"
              className="h-10"
            />
          </div>
        </div>

        {/* Notes / Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Note / Description</label>
          <Input
            {...register("description")}
            placeholder="Add optional notes or itemized breakdown..."
            className="h-10"
          />
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
              "Add Entry"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
