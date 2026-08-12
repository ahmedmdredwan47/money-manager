"use client";

import React from "react";
import { TransactionWithCategoryAndAccount } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatCryptoQuantity } from "@/features/crypto-holdings/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface TransactionTableProps {
  transactions: TransactionWithCategoryAndAccount[];
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onEdit: (transaction: TransactionWithCategoryAndAccount) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({
  transactions,
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const fromRecord = Math.min((page - 1) * pageSize + 1, totalCount);
  const toRecord = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/60 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description / Payee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.map((tx) => {
                const isIncome = tx.type === "income";
                const isExpense = tx.type === "expense";
                const isTransfer = tx.type === "transfer";

                return (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    {/* Date */}
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Payee / Description */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-500"
                              : isExpense
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : isExpense ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <ArrowRightLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none text-foreground">
                            {tx.payee_merchant || (isTransfer ? "Account Transfer" : "Transaction")}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          isIncome ? "success" : isExpense ? "destructive" : "outline"
                        }
                        className="text-[10px] capitalize"
                      >
                        {tx.type}
                      </Badge>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      {tx.category ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: tx.category.color || "#3b82f6" }}
                          />
                          <span className="text-xs font-medium">{tx.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Account Attachment */}
                    <td className="px-4 py-3.5">
                      {isTransfer ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <span className="text-foreground font-semibold">
                            {tx.account?.name || "Source"}
                          </span>
                          <ArrowRight className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="text-foreground font-semibold">
                            {tx.transfer_account?.name || "Destination"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-foreground">
                          {tx.account?.name || "Main Account"}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? "text-emerald-500"
                            : isExpense
                            ? "text-rose-500"
                            : "text-foreground"
                        }
                      >
                        {tx.crypto_quantity ? <span className="flex flex-col items-end gap-0.5"><span>{isIncome ? "+" : "-"}{formatCryptoQuantity(tx.crypto_quantity)} {tx.crypto_asset?.code || "Crypto"}</span><span className="text-[10px] font-medium text-muted-foreground">≈ {formatCurrency(tx.bdt_amount ?? tx.amount, "BDT")}</span></span> : <>{isIncome ? "+" : isExpense ? "-" : ""}{formatCurrency(tx.amount, tx.currency || "BDT")}</>}
                      </span>
                    </td>

                    {/* Action Dropdown Menu */}
                    <td className="px-4 py-3.5 text-center">
                      <DropdownMenu
                        trigger={
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Transaction Options</span>
                          </button>
                        }
                      >
                        <DropdownMenuItem onClick={() => onEdit(tx)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          <span>Edit Entry</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(tx.id)}
                          className="text-rose-500 focus:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Entry</span>
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-1">
        <div>
          Showing <span className="font-semibold text-foreground">{totalCount > 0 ? fromRecord : 0}</span> to{" "}
          <span className="font-semibold text-foreground">{toRecord}</span> of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 px-2.5 text-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>

          <span className="px-2 font-semibold text-foreground">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 px-2.5 text-xs"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
