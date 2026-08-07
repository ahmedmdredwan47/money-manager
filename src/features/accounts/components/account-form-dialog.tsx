"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  accountSchema,
  accountTypes,
  accountTypeLabels,
  type AccountFormInput,
  type AccountTypeEnum,
} from "../schemas/account-schema";
import { useCreateAccount, useUpdateAccount } from "../hooks/use-accounts";
import { Account } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Banknote,
  Smartphone,
  Flame,
  Rocket,
  CreditCard,
  Landmark,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: Account | null;
}

export function AccountFormDialog({
  open,
  onOpenChange,
  accountToEdit,
}: AccountFormDialogProps) {
  const isEditing = Boolean(accountToEdit);
  const [error, setError] = useState<string | null>(null);

  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "bank",
      balance: 0,
      currency: "BDT",
      account_number_last4: "",
      color: "#3b82f6",
      is_active: true,
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (accountToEdit) {
      reset({
        name: accountToEdit.name,
        type: (accountTypes.includes(accountToEdit.type as any)
          ? accountToEdit.type
          : "bank") as AccountTypeEnum,
        balance: accountToEdit.balance,
        currency: accountToEdit.currency || "BDT",
        account_number_last4: accountToEdit.account_number_last4 || "",
        color: accountToEdit.color || "#3b82f6",
        is_active: accountToEdit.is_active,
      });
    } else {
      reset({
        name: "",
        type: "bank",
        balance: 0,
        currency: "BDT",
        account_number_last4: "",
        color: "#3b82f6",
        is_active: true,
      });
    }
    setError(null);
  }, [accountToEdit, open, reset]);

  const onSubmit = async (data: AccountFormInput) => {
    setError(null);
    try {
      if (isEditing && accountToEdit) {
        await updateAccountMutation.mutateAsync({
          id: accountToEdit.id,
          input: data,
        });
      } else {
        await createAccountMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save account details.");
    }
  };

  const getAccountIcon = (type: AccountTypeEnum) => {
    switch (type) {
      case "bank":
        return Building2;
      case "cash":
        return Banknote;
      case "bkash":
        return Smartphone;
      case "nagad":
        return Flame;
      case "rocket":
        return Rocket;
      case "card":
        return CreditCard;
      default:
        return Landmark;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Account" : "Add New Account"}
      description={
        isEditing
          ? "Update institution details, balance, or status."
          : "Connect a new Bank, bKash, Nagad, Rocket, Cash, or Credit Card account."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Type Selector Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Account Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {accountTypes.map((t) => {
              const Icon = getAccountIcon(t);
              const isSelected = selectedType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t, { shouldValidate: true })}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{accountTypeLabels[t]}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="text-xs text-rose-500 font-medium">{errors.type.message}</p>
          )}
        </div>

        {/* Account Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Account Name
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Brac Bank Savings, Personal bKash, Cash Wallet"
            className="h-10"
          />
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Balance & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Current Balance
            </label>
            <Input
              {...register("balance")}
              type="number"
              step="any"
              placeholder="0.00"
              className="h-10 font-mono"
            />
            {errors.balance && (
              <p className="text-xs text-rose-500 font-medium">{errors.balance.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Currency
            </label>
            <Input
              {...register("currency")}
              placeholder="BDT, USD, EUR"
              className="h-10 uppercase"
            />
            {errors.currency && (
              <p className="text-xs text-rose-500 font-medium">{errors.currency.message}</p>
            )}
          </div>
        </div>

        {/* Account Last 4 Digits */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Account Number (Last 4 Digits - Optional)
          </label>
          <Input
            {...register("account_number_last4")}
            placeholder="e.g. 4920"
            maxLength={4}
            className="h-10 font-mono"
          />
          {errors.account_number_last4 && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.account_number_last4.message}
            </p>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
          <div>
            <p className="text-xs font-semibold text-foreground">Active Status</p>
            <p className="text-[11px] text-muted-foreground">
              Include this account in total net worth calculations
            </p>
          </div>
          <input
            type="checkbox"
            {...register("is_active")}
            className="h-4 w-4 accent-emerald-500 rounded"
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
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
