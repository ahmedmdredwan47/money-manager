"use client";

import React from "react";
import Link from "next/link";
import { TransactionWithCategoryAndAccount } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowRightLeft, ArrowRight } from "lucide-react";

interface DashboardRecentActivityProps {
  recentTransactions: TransactionWithCategoryAndAccount[];
}

export function DashboardRecentActivity({ recentTransactions }: DashboardRecentActivityProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
          <CardDescription className="text-xs">5 latest transactions</CardDescription>
        </div>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="text-xs text-emerald-500 font-semibold hover:text-emerald-600">
            View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((tx) => {
          const isIncome = tx.type === "income";
          const isExpense = tx.type === "expense";

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors border border-border/40"
            >
              <div className="flex items-center gap-3">
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
                  <p className="text-xs font-semibold text-foreground leading-none">
                    {tx.payee_merchant || (tx.type === "transfer" ? "Account Transfer" : "Transaction")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {tx.category?.name || tx.type} • {tx.date}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold font-mono ${
                  isIncome
                    ? "text-emerald-500"
                    : isExpense
                    ? "text-rose-500"
                    : "text-foreground"
                }`}
              >
                {isIncome ? "+" : isExpense ? "-" : ""}
                {formatCurrency(tx.amount, tx.currency || "BDT")}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
