import { useMemo } from "react";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { calculateAccountBalance, calculateAccountBdtBalance } from "@/lib/account-utils";
import { useExchangeRates, convertToBDT, getTransactionBdtAmount } from "@/lib/exchange-rates";

export function useDashboard() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: txResult, isLoading: txLoading } = useTransactions({ pageSize: 500 });
  const { data: categories } = useCategories();
  const { data: ratesData } = useExchangeRates();

  const isLoading = accountsLoading || txLoading;

  return useMemo(() => {
    const allAccounts = accounts || [];
    const allTransactions = txResult?.data || [];
    const allCategories = categories || [];
    const rates = ratesData?.rates ?? { BDT: 1 };

    const todayStr = new Date().toISOString().split("T")[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // 1. Current Balance — sum of active account balances converted to BDT (excluding accounts with unavailable rates)
    let hasUnavailableRates = false;
    const currentBalance = allAccounts
      .filter((a) => a.is_active)
      .reduce((sum, a) => {
        const bdtVal = calculateAccountBdtBalance(a, allTransactions, rates);
        if (bdtVal === null) {
          hasUnavailableRates = true;
          return sum; // Strictly exclude unavailable conversions from combined BDT sum
        }
        return sum + bdtVal;
      }, 0);

    // 2. Today's Expense (converted to BDT)
    const todaysExpense = allTransactions
      .filter((t) => t.type === "expense" && t.date === todayStr)
      .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

    // 3. This Month Income & Expense (converted to BDT)
    const thisMonthIncome = allTransactions
      .filter((t) => {
        if (t.type !== "income") return false;
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

    const thisMonthExpense = allTransactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + getTransactionBdtAmount(t, rates), 0);

    // 4. Monthly Savings & Savings Rate (both in BDT)
    const monthlySavings = thisMonthIncome - thisMonthExpense;
    const savingsRate =
      thisMonthIncome > 0 ? Math.max(0, Math.min(100, (monthlySavings / thisMonthIncome) * 100)) : 0;

    // 5. Recent Transactions (top 5)
    const recentTransactions = [...allTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // 6. Category Breakdown (Expense distribution in BDT for Pie Chart & Top Categories)
    const categoryTotals: Record<string, number> = {};
    allTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const catName = t.category?.name || "Uncategorized";
        categoryTotals[catName] = (categoryTotals[catName] || 0) + getTransactionBdtAmount(t, rates);
      });

    const categoryBreakdownData = Object.entries(categoryTotals)
      .map(([name, value]) => {
        const catObj = allCategories.find((c) => c.name === name);
        return {
          name,
          value,
          color: catObj?.color || "#3b82f6",
          icon: catObj?.icon || "Tag",
        };
      })
      .sort((a, b) => b.value - a.value);

    const totalExpenseSum = categoryBreakdownData.reduce((s, c) => s + c.value, 0);
    const topCategories = categoryBreakdownData.slice(0, 5).map((c) => ({
      ...c,
      percentage: totalExpenseSum > 0 ? (c.value / totalExpenseSum) * 100 : 0,
    }));

    // 7. Monthly Cash Flow Trend (Last 6 Months Area Chart in BDT)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrendData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(currentMonth - (5 - i));
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthLabel = months[monthIdx];

      const monthIncome = allTransactions
        .filter((t) => {
          if (t.type !== "income") return false;
          const td = new Date(t.date);
          return td.getFullYear() === year && td.getMonth() === monthIdx;
        })
        .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

      const monthExpense = allTransactions
        .filter((t) => {
          if (t.type !== "expense") return false;
          const td = new Date(t.date);
          return td.getFullYear() === year && td.getMonth() === monthIdx;
        })
        .reduce((s, t) => s + getTransactionBdtAmount(t, rates), 0);

      return {
        month: monthLabel,
        Income: monthIncome,
        Expenses: monthExpense,
      };
    });

    return {
      isLoading,
      currentBalance,
      usingFallbackRates: ratesData?.usingFallback ?? false,
      hasUnavailableRates,
      ratesFetchedAt: ratesData?.fetchedAt,
      todaysExpense,
      thisMonthIncome,
      thisMonthExpense,
      monthlySavings,
      savingsRate,
      recentTransactions,
      categoryBreakdownData,
      topCategories,
      monthlyTrendData,
    };
  }, [accounts, txResult, categories, ratesData, isLoading]);
}
