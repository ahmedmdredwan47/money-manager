import { Account, Transaction, AccountWithBalances } from "@/types";
import { convertToBDT } from "./exchange-rates";

/**
 * Calculates the current available balance for a single account in its NATIVE currency
 * based on its initial balance and all recorded transactions (income, expense, and transfers).
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[]
): number {
  const initialBalance = Number(account.balance) || 0;

  const netTransactions = transactions.reduce((sum, t) => {
    const amount = Number(t.amount) || 0;

    // Primary account for income, expense, or outgoing transfer
    if (t.account_id === account.id) {
      if (t.type === "income") {
        return sum + amount;
      }
      if (t.type === "expense") {
        return sum - amount;
      }
      if (t.type === "transfer") {
        return sum - amount; // Money leaves this source account
      }
    }

    // Destination account for incoming transfer
    if (t.type === "transfer" && t.transfer_account_id === account.id) {
      return sum + amount; // Money arrives into this destination account
    }

    return sum;
  }, 0);

  return initialBalance + netTransactions;
}

/**
 * Calculates the BDT equivalent balance for a single account using exchange rates.
 */
export function calculateAccountBdtBalance(
  account: Account,
  transactions: Transaction[],
  rates: Record<string, number>
): number | null {
  const nativeBalance = calculateAccountBalance(account, transactions);
  return convertToBDT(nativeBalance, account.currency || "BDT", rates);
}

/**
 * Returns full account data model details preserving:
 * - native_balance (original currency amount)
 * - currency_code (account's original currency, e.g. "USD")
 * - bdt_equivalent (calculated as native_balance × exchange_rate)
 */
export function getAccountBalanceDetails(
  account: Account,
  transactions: Transaction[],
  rates: Record<string, number>
): AccountWithBalances {
  const native_balance = calculateAccountBalance(account, transactions);
  const currency_code = account.currency || "BDT";
  const bdt_equivalent = convertToBDT(native_balance, currency_code, rates);

  return {
    ...account,
    balance: native_balance, // retains original currency balance
    native_balance,
    currency_code,
    bdt_equivalent,
  };
}
