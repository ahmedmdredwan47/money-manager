import { useMemo } from "react";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useExchangeRates, getTransactionBdtAmount } from "@/lib/exchange-rates";

export interface ReportFilterOptions {
  periodMode: "monthly" | "yearly" | "category";
  typeFilter: "all" | "income" | "expense";
  year: number;
  month: number; // 1-12
  accountId?: string;
}

export function useReports(options: ReportFilterOptions) {
  const { data: txResult, isLoading: txLoading } = useTransactions({ pageSize: 500 });
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: ratesData } = useExchangeRates();

  const isLoading = txLoading || catLoading;

  return useMemo(() => {
    const allTransactions = txResult?.data || [];
    const allCategories = categories || [];
    const rates = ratesData?.rates ?? { BDT: 1 };

    // Filter transactions based on options
    const filteredTransactions = allTransactions.filter((t) => {
      const d = new Date(t.date);
      const txYear = d.getFullYear();
      const txMonth = d.getMonth() + 1;

      if (options.periodMode === "monthly" && (txYear !== options.year || txMonth !== options.month)) {
        return false;
      }
      if (options.periodMode === "yearly" && txYear !== options.year) {
        return false;
      }
      if (options.typeFilter !== "all" && t.type !== options.typeFilter) {
        return false;
      }
      if (options.accountId && t.account_id !== options.accountId && t.transfer_account_id !== options.accountId) {
        return false;
      }
      return true;
    });

    // 1. Summary Stats (in BDT)
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

    const netSavings = totalIncome - totalExpense;
    const totalCount = filteredTransactions.length;
    const avgTxSize = totalCount > 0 ? (totalIncome + totalExpense) / totalCount : 0;

    // 2. Chart Series (in BDT)
    let chartSeries: Array<{ label: string; Income: number; Expenses: number }> = [];

    if (options.periodMode === "monthly") {
      // Group by day of month (1 to 30/31)
      const daysInMonth = new Date(options.year, options.month, 0).getDate();
      chartSeries = Array.from({ length: daysInMonth }).map((_, i) => {
        const dayNum = i + 1;
        const dayLabel = `${dayNum}`;

        const dayIncome = filteredTransactions
          .filter((t) => t.type === "income" && new Date(t.date).getDate() === dayNum)
          .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

        const dayExpense = filteredTransactions
          .filter((t) => t.type === "expense" && new Date(t.date).getDate() === dayNum)
          .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

        return { label: dayLabel, Income: dayIncome, Expenses: dayExpense };
      });
    } else {
      // Group by month (Jan - Dec)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      chartSeries = monthNames.map((monthName, idx) => {
        const mNum = idx + 1;

        const mIncome = filteredTransactions
          .filter((t) => t.type === "income" && new Date(t.date).getMonth() + 1 === mNum)
          .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

        const mExpense = filteredTransactions
          .filter((t) => t.type === "expense" && new Date(t.date).getMonth() + 1 === mNum)
          .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

        return { label: monthName, Income: mIncome, Expenses: mExpense };
      });
    }

    // 3. Category Breakdown (in BDT)
    const catMap: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      const catName = t.category?.name || (t.type === "transfer" ? "Transfers" : "Uncategorized");
      catMap[catName] = (catMap[catName] || 0) + getTransactionBdtAmount(t, rates);
    });

    const totalAmountSum = Object.values(catMap).reduce((s, v) => s + v, 0);

    const categoryBreakdown = Object.entries(catMap)
      .map(([name, value]) => {
        const catObj = allCategories.find((c) => c.name === name);
        return {
          name,
          value,
          percentage: totalAmountSum > 0 ? (value / totalAmountSum) * 100 : 0,
          color: catObj?.color || (name === "Transfers" ? "#64748b" : "#3b82f6"),
        };
      })
      .sort((a, b) => b.value - a.value);

    return {
      isLoading,
      summaryStats: {
        totalIncome,
        totalExpense,
        netSavings,
        totalCount,
        avgTxSize,
      },
      chartSeries,
      categoryBreakdown,
      filteredTransactions,
    };
  }, [txResult, categories, ratesData, options, isLoading]);
}
