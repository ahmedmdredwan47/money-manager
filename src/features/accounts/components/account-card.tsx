"use client";

import React from "react";
import { Account } from "@/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { convertToBDT } from "@/lib/exchange-rates";
import { cryptoBdtValueAsNumber, formatCryptoQuantity } from "@/features/crypto-holdings/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Banknote,
  Smartphone,
  Flame,
  Rocket,
  CreditCard,
  Landmark,
  MoreVertical,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  /** BDT-denominated exchange rates from useExchangeRates() */
  rates?: Record<string, number>;
  /** ISO timestamp of when rates were last fetched from the upstream source */
  ratesFetchedAt?: string;
  /** True when fallback (offline) rates are being used */
  ratesAreFallback?: boolean;
  cryptoHolding?: { quantity: string; code: string; bdtPrice?: string };
}

export function AccountCard({
  account,
  onEdit,
  onDelete,
  rates,
  ratesFetchedAt,
  ratesAreFallback,
  cryptoHolding,
}: AccountCardProps) {
  const getAccountStyle = (type: string) => {
    switch (type) {
      case "bank":
      case "checking":
      case "savings":
        return {
          icon: Building2,
          badgeText: type === "checking" ? "Checking" : type === "savings" ? "Savings" : "Bank",
          badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          iconBg: "bg-blue-500/10 text-blue-500",
        };
      case "bkash":
        return {
          icon: Smartphone,
          badgeText: "bKash (MFS)",
          badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          iconBg: "bg-rose-500/10 text-rose-500",
        };
      case "nagad":
        return {
          icon: Flame,
          badgeText: "Nagad (MFS)",
          badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          iconBg: "bg-orange-500/10 text-orange-500",
        };
      case "rocket":
        return {
          icon: Rocket,
          badgeText: "Rocket (MFS)",
          badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
          iconBg: "bg-violet-500/10 text-violet-500",
        };
      case "cash":
        return {
          icon: Banknote,
          badgeText: "Cash / Wallet",
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          iconBg: "bg-emerald-500/10 text-emerald-500",
        };
      case "card":
      case "credit_card":
        return {
          icon: CreditCard,
          badgeText: "Credit Card",
          badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          iconBg: "bg-purple-500/10 text-purple-500",
        };
      case "investment":
      case "loan":
        return {
          icon: Landmark,
          badgeText: type === "investment" ? "Investment" : "Loan",
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          iconBg: "bg-amber-500/10 text-amber-500",
        };
      default:
        return {
          icon: Landmark,
          badgeText: "Other Account",
          badgeColor: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          iconBg: "bg-slate-500/10 text-slate-500",
        };
    }
  };

  const style = getAccountStyle(account.type);
  const Icon = style.icon;

  // ── Currency conversion info ──────────────────────────────────────────────
  const currency = account.currency || "BDT";
  const isForeign = currency !== "BDT";

  // BDT-equivalent of this account's current balance
  const bdtEquivalent =
    isForeign && rates
      ? convertToBDT(account.balance, currency, rates)
      : null;

  // 1 <currency> = X BDT  (the rate shown to the user)
  // rates[currency] = how many foreign units per 1 BDT
  // → 1 foreign unit = 1 / rates[currency] BDT
  const oneForeignInBdt =
    isForeign && rates && rates[currency] && rates[currency] > 0
      ? 1 / rates[currency]
      : null;
  const cryptoBdtValue = cryptoHolding?.bdtPrice
    ? cryptoBdtValueAsNumber(cryptoHolding.quantity, cryptoHolding.bdtPrice)
    : null;

  const displayBalanceText = cryptoHolding
    ? cryptoBdtValue !== null
      ? formatCurrency(cryptoBdtValue, "BDT")
      : "Unavailable"
    : formatCurrency(account.balance, currency);

  const isNegativeBalance = cryptoHolding
    ? (cryptoBdtValue ?? 0) < 0
    : account.balance < 0;

  return (
    <Card className="relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${style.iconBg} transition-transform group-hover:scale-105`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold truncate max-w-[150px] sm:max-w-[180px]">
              {account.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badgeColor}`}>
                {style.badgeText}
              </span>
              {account.account_number_last4 && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  ••{account.account_number_last4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options Dropdown Menu */}
        <DropdownMenu
          trigger={
            <button className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground transition-all">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Account Options</span>
            </button>
          }
        >
          <DropdownMenuItem onClick={() => onEdit(account)}>
            <Pencil className="h-4 w-4 text-muted-foreground" />
            <span>Edit Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(account.id)}
            className="text-rose-500 focus:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pt-2 space-y-2">
        {/* Primary balance row */}
        {cryptoHolding ? <>
          <div className="flex items-baseline justify-between"><span className="text-xs text-muted-foreground font-medium">Crypto Holding</span><span className="text-[10px] font-bold text-muted-foreground/70">{cryptoHolding.code}</span></div>
          <div className="flex items-baseline justify-between"><span className="text-2xl font-bold font-mono tracking-tight">{formatCryptoQuantity(cryptoHolding.quantity)} {cryptoHolding.code}</span><Badge variant={account.is_active ? "success" : "outline"} className="text-[10px]">{account.is_active ? "Active" : "Archived"}</Badge></div>
          <div className="mt-1 border-t border-border/40 pt-2"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">≈ BDT value</span><span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{cryptoBdtValue === null ? "Unavailable" : formatCurrency(cryptoBdtValue, "BDT")}</span></div></div>
        </> : <>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground font-medium">Available Balance</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground/70">{currency}</span>
        </div>
        </>}

        <div className="flex items-baseline justify-between">
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${
              isNegativeBalance ? "text-rose-500" : "text-foreground"
            }`}
          >
            {displayBalanceText}
          </span>
          {!cryptoHolding && (
            <Badge variant={account.is_active ? "success" : "outline"} className="text-[10px]">
              {account.is_active ? "Active" : "Archived"}
            </Badge>
          )}
        </div>

        {/* BDT equivalent block — only for foreign-currency accounts */}
        {!cryptoHolding && isForeign && (
          <div className="mt-1 pt-2 border-t border-border/40 space-y-1">
            {bdtEquivalent !== null ? (
              <>
                {/* ≈ ৳ equivalent */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">≈ BDT equivalent</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      bdtEquivalent < 0 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatCurrency(bdtEquivalent, "BDT")}
                  </span>
                </div>

                {/* Rate line: 1 USD = 122.50 BDT */}
                {oneForeignInBdt !== null && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground/80 pt-0.5">
                    <span>1 {currency} = {oneForeignInBdt.toFixed(2)} BDT</span>
                  </div>
                )}

                {/* Last updated line */}
                <div className="flex items-center gap-1 pt-0.5">
                  {ratesAreFallback ? (
                    <AlertTriangle className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                  ) : (
                    <RefreshCw className="h-2.5 w-2.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className="text-[10px] text-muted-foreground/60">
                    {ratesAreFallback
                      ? "Estimated rate (offline)"
                      : `Rate updated ${formatRelativeTime(ratesFetchedAt)}`}
                  </span>
                </div>
              </>
            ) : (
              /* Rate unavailable case — DO NOT show 1:1 fake conversion */
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-medium">
                  <span>≈ BDT equivalent</span>
                  <span className="font-semibold text-[11px]">Unavailable</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Exchange rate missing for {currency}. Balance excluded from BDT total.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
