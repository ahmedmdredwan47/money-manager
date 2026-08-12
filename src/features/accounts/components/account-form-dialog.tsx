"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { SUPPORTED_CURRENCIES, CURRENCY_MAP } from "@/lib/currencies";
import { useExchangeRates, convertToBDT, convertCurrency } from "@/lib/exchange-rates";
import { formatCurrency } from "@/lib/utils";
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
  ChevronDown,
  Search,
} from "lucide-react";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: Account | null;
}

// ---------------------------------------------------------------------------
// Searchable Currency Dropdown
// ---------------------------------------------------------------------------
interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
}

function CurrencySelect({ value, onChange, error }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = CURRENCY_MAP[value];

  const filtered = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        id="currency-select-trigger"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-between w-full h-10 px-3 rounded-lg border text-sm font-medium transition-all
          ${error ? "border-rose-500 bg-rose-500/5" : "border-input bg-background hover:border-emerald-500/60"}
          ${open ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""}
          focus:outline-none`}
      >
        <span className="flex items-center gap-2 text-sm truncate">
          {selected ? (
            <>
              <span className="text-base leading-none">{selected.flag}</span>
              <span className="font-bold">{selected.code}</span>
              <span className="text-muted-foreground truncate">- {selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select currency…</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search currency…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Currency list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-muted-foreground text-center">
                No currencies found
              </li>
            )}
            {filtered.map((c) => {
              const isSelected = c.code === value;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors
                      ${isSelected
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "hover:bg-muted/50 text-foreground"
                      }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded w-10 text-center text-muted-foreground">
                      {c.code}
                    </span>
                    <span className="flex-1 text-left truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{c.symbol}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 ml-1 shrink-0 text-emerald-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Form Dialog
// ---------------------------------------------------------------------------
export function AccountFormDialog({
  open,
  onOpenChange,
  accountToEdit,
}: AccountFormDialogProps) {
  const isEditing = Boolean(accountToEdit);
  const [error, setError] = useState<string | null>(null);
  const [currencyConfirmed, setCurrencyConfirmed] = useState(false);

  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const { data: ratesData } = useExchangeRates();

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
  const selectedCurrency = watch("currency");
  const enteredBalance = watch("balance");

  const rates = ratesData?.rates ?? { BDT: 1 };
  const isForeign = selectedCurrency && selectedCurrency !== "BDT";
  const numBalance = Number(enteredBalance) || 0;
  const bdtPreview = isForeign ? convertToBDT(numBalance, selectedCurrency, rates) : null;
  const oneForeignRate = isForeign && rates[selectedCurrency] ? 1 / rates[selectedCurrency] : null;

  // Currency change check during editing
  const isCurrencyChanged = Boolean(
    isEditing && accountToEdit && selectedCurrency !== (accountToEdit.currency || "BDT")
  );

  const rawConverted = accountToEdit
    ? convertCurrency(
        accountToEdit.balance,
        accountToEdit.currency || "BDT",
        selectedCurrency,
        rates
      )
    : null;
  const autoConvertedBalance = rawConverted !== null ? Number(rawConverted.toFixed(2)) : 0;

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
    setCurrencyConfirmed(false);
    setError(null);
  }, [accountToEdit, open, reset]);

  const onSubmit = async (data: AccountFormInput) => {
    setError(null);
    if (isCurrencyChanged && !currencyConfirmed) {
      setError(
        `Currency changed from ${accountToEdit?.currency || "BDT"} to ${selectedCurrency}. Please confirm the currency change below before saving.`
      );
      return;
    }
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
            <CurrencySelect
              value={selectedCurrency}
              onChange={(code) => setValue("currency", code, { shouldValidate: true })}
              error={errors.currency?.message}
            />
          </div>
        </div>

        {/* Live BDT Conversion Preview helper box */}
        {isForeign && bdtPreview !== null && !isCurrencyChanged && (
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">BDT Equivalent:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(bdtPreview, "BDT")}
              </span>
            </div>
            {oneForeignRate !== null && (
              <span className="text-[11px] font-mono text-muted-foreground">
                1 {selectedCurrency} = {oneForeignRate.toFixed(2)} BDT
              </span>
            )}
          </div>
        )}

        {/* Currency Change Warning & Confirmation Box during Edit */}
        {isCurrencyChanged && accountToEdit && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs space-y-2.5">
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Currency Changed: {accountToEdit.currency} → {selectedCurrency}</p>
                <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                  Changing currency will re-denominate the stored balance. Choose how you want to handle the current balance:
                </p>
              </div>
            </div>

            {/* Quick Conversion Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setValue("balance", autoConvertedBalance, { shouldValidate: true });
                  setCurrencyConfirmed(true);
                }}
                className="flex flex-col items-start p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-colors"
              >
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  ⚡ Convert Balance
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Set balance to {autoConvertedBalance} {selectedCurrency}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue("balance", accountToEdit.balance, { shouldValidate: true });
                  setCurrencyConfirmed(true);
                }}
                className="flex flex-col items-start p-2 rounded-lg border border-border bg-background/60 hover:bg-muted text-left transition-colors"
              >
                <span className="font-semibold text-foreground text-[11px]">
                  Keep Numeric Balance
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Keep balance as {accountToEdit.balance} {selectedCurrency}
                </span>
              </button>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-center gap-2 pt-1 border-t border-amber-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={currencyConfirmed}
                onChange={(e) => setCurrencyConfirmed(e.target.checked)}
                className="h-4 w-4 accent-amber-500 rounded"
              />
              <span className="font-medium text-foreground text-[11px]">
                I confirm changing this account&apos;s currency from {accountToEdit.currency} to {selectedCurrency}
              </span>
            </label>
          </div>
        )}

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
