"use client";

import React from "react";
import { TransactionWithCategoryAndAccount } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags, List } from "lucide-react";

interface ReportsTableProps {
  categoryBreakdown: Array<{ name: string; value: number; percentage: number; color: string }>;
  transactions: TransactionWithCategoryAndAccount[];
}

export function ReportsTable({ categoryBreakdown, transactions }: ReportsTableProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Ranking Breakdown Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Tags className="h-4 w-4 text-emerald-500" />
            Category Rankings
          </CardTitle>
          <CardDescription className="text-xs">Category shares & total amounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="p-2.5 rounded-xl border border-border/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-foreground">{cat.name}</span>
                </div>
                <span className="font-mono text-foreground font-bold">
                  {formatCurrency(cat.value, "BDT")}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(cat.percentage, 100)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction Ledger Records Table */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <List className="h-4 w-4 text-blue-500" />
            Filtered Transaction Ledger
          </CardTitle>
          <CardDescription className="text-xs">
            Showing {transactions.length} matching records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 border-b border-border/50">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.date}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs text-foreground">
                        {tx.payee_merchant || (tx.type === "transfer" ? "Account Transfer" : "Transaction")}
                      </p>
                      {tx.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{tx.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={tx.type === "income" ? "success" : tx.type === "expense" ? "destructive" : "outline"}
                        className="text-[10px] capitalize"
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                      {tx.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-xs">
                      <span className={tx.type === "income" ? "text-emerald-500" : tx.type === "expense" ? "text-rose-500" : "text-foreground"}>
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                        {formatCurrency(tx.amount, tx.currency || "BDT")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
