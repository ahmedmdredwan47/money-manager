"use client";

import React, { useState } from "react";
import { useTransactions, useDeleteTransaction } from "../hooks/use-transactions";
import { useExchangeRates, getTransactionBdtAmount } from "@/lib/exchange-rates";
import { TransactionFilters } from "./transaction-filters";
import { TransactionTable } from "./transaction-table";
import { TransactionWithCategoryAndAccount } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Plus,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";

interface TransactionsListProps {
  onOpenCreateDialog: () => void;
  onEditTransaction: (tx: TransactionWithCategoryAndAccount) => void;
}

export function TransactionsList({
  onOpenCreateDialog,
  onEditTransaction,
}: TransactionsListProps) {
  const [type, setType] = useState<"all" | "income" | "expense" | "transfer">("all");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const { data: result, isLoading, isError, error } = useTransactions({
    type,
    account_id: accountId || undefined,
    category_id: categoryId || undefined,
    search: searchQuery || undefined,
    page,
    pageSize: 10,
  });

  const deleteTxMutation = useDeleteTransaction();
  const { data: ratesData } = useExchangeRates();

  const resetFilters = () => {
    setType("all");
    setAccountId("");
    setCategoryId("");
    setSearchQuery("");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!txToDelete) return;
    try {
      await deleteTxMutation.mutateAsync(txToDelete);
      setTxToDelete(null);
    } catch (err) {
      console.error("Delete transaction error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-6 text-center text-rose-500">
          <p className="font-semibold">Failed to load transactions</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const txData = result?.data || [];
  const totalCount = result?.totalCount || 0;
  const totalPages = result?.totalPages || 1;
  const rates = ratesData?.rates ?? { BDT: 1 };

  // Calculate summary metrics in BDT from current view
  const totalIncome = txData
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);
  const totalExpense = txData
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);
  const netCashflow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Period Income
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-500 tracking-tight">
              +{formatCurrency(totalIncome, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total received revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Period Expenses
            </CardTitle>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-500 tracking-tight">
              -{formatCurrency(totalExpense, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total spending outflow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Cash Flow
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold font-mono tracking-tight ${
                netCashflow < 0 ? "text-rose-500" : "text-emerald-500"
              }`}
            >
              {netCashflow >= 0 ? "+" : ""}
              {formatCurrency(netCashflow, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net difference in current view</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <TransactionFilters
        type={type}
        onTypeChange={(t) => {
          setType(t);
          setPage(1);
        }}
        accountId={accountId}
        onAccountChange={(acc) => {
          setAccountId(acc);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(cat) => {
          setCategoryId(cat);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        onResetFilters={resetFilters}
      />

      {/* Master Table or Empty State */}
      {txData.length > 0 ? (
        <TransactionTable
          transactions={txData}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={10}
          onPageChange={setPage}
          onEdit={onEditTransaction}
          onDelete={(id) => setTxToDelete(id)}
        />
      ) : (
        <Card className="text-center p-8 border-dashed border-border/70">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg font-bold">No Transactions Found</CardTitle>
          <CardDescription className="max-w-sm mx-auto mt-1 mb-6">
            {searchQuery || type !== "all" || accountId || categoryId
              ? "No ledger entries match your filter or search terms."
              : "Log your first Income, Expense, or Account Transfer entry."}
          </CardDescription>
          <Button variant="gradient" onClick={onOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction Now
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(txToDelete)}
        onOpenChange={(open) => !open && setTxToDelete(null)}
        title="Delete Transaction?"
        description="Are you sure you want to delete this transaction entry? This will update your account balances."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setTxToDelete(null)}
            disabled={deleteTxMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteTxMutation.isPending}
          >
            {deleteTxMutation.isPending ? (
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
