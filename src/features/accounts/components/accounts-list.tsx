"use client";

import React, { useState } from "react";
import { useAccounts, useDeleteAccount } from "../hooks/use-accounts";
import { AccountCard } from "./account-card";
import { Account } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Wallet,
  Building2,
  Smartphone,
  Banknote,
  Plus,
  Search,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";

interface AccountsListProps {
  onOpenCreateDialog: () => void;
  onEditAccount: (account: Account) => void;
}

export function AccountsList({
  onOpenCreateDialog,
  onEditAccount,
}: AccountsListProps) {
  const { data: accounts, isLoading, isError, error } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "bank" | "mfs" | "cash" | "card">("all");
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full rounded-2xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-6 text-center text-rose-500">
          <p className="font-semibold">Failed to load accounts</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const allAccounts = accounts || [];

  // Filter accounts
  const filteredAccounts = allAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "bank") return acc.type === "bank" || acc.type === "checking" || acc.type === "savings";
    if (activeTab === "mfs") return acc.type === "bkash" || acc.type === "nagad" || acc.type === "rocket";
    if (activeTab === "cash") return acc.type === "cash";
    if (activeTab === "card") return acc.type === "card" || acc.type === "credit_card";

    return true;
  });

  // Calculate Summary metrics
  const totalBalance = allAccounts.reduce((sum, acc) => sum + (acc.is_active ? acc.balance : 0), 0);
  const bankBalance = allAccounts
    .filter((a) => a.type === "bank" || a.type === "checking" || a.type === "savings")
    .reduce((sum, acc) => sum + acc.balance, 0);
  const mfsBalance = allAccounts
    .filter((a) => a.type === "bkash" || a.type === "nagad" || a.type === "rocket")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccountMutation.mutateAsync(accountToDelete);
      setAccountToDelete(null);
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Accounts Balance
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(totalBalance, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {allAccounts.filter((a) => a.is_active).length} active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bank Balance
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(bankBalance, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Institutional bank deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mobile Financial Services (MFS)
            </CardTitle>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {formatCurrency(mfsBalance, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">bKash, Nagad, & Rocket wallets</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-muted/60 border border-border/50">
          {[
            { id: "all", label: "All Accounts" },
            { id: "bank", label: "Banks" },
            { id: "mfs", label: "MFS (bKash/Nagad/Rocket)" },
            { id: "cash", label: "Cash" },
            { id: "card", label: "Cards" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onEdit={onEditAccount}
              onDelete={(id) => setAccountToDelete(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center p-8 border-dashed border-border/70">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg font-bold">No Accounts Found</CardTitle>
          <CardDescription className="max-w-sm mx-auto mt-1 mb-6">
            {searchQuery || activeTab !== "all"
              ? "No accounts match your current filter or search criteria."
              : "Connect your first Bank, bKash, Nagad, Rocket, Cash, or Credit Card account to start tracking."}
          </CardDescription>
          <Button variant="gradient" onClick={onOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Account Now
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(accountToDelete)}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
        title="Delete Account?"
        description="Are you sure you want to delete this account? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setAccountToDelete(null)}
            disabled={deleteAccountMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Confirm Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
