import { describe, expect, it } from "vitest";
import {
  calculateAccountBalance,
  calculateAccountBdtBalance,
  calculateTotalNetWorthBDT,
  getAccountBalanceDetails,
} from "./account-utils";
import { Account, Transaction } from "@/types";

describe("account-utils safety net", () => {
  const sampleAccount: Account = {
    id: "acc-1",
    user_id: "user-123",
    name: "Checking Account",
    type: "checking",
    balance: 1000,
    currency: "USD",
    account_number_last4: "1234",
    color: "#000",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  const sampleRates: Record<string, number> = {
    BDT: 1,
    USD: 0.00817, // ~122.39 BDT per USD
    EUR: 0.00756,
  };

  it("calculates balance correctly with income and expense transactions", () => {
    const transactions = [
      {
        id: "tx-1",
        user_id: "user-123",
        account_id: "acc-1",
        type: "income",
        amount: 500,
        currency: "USD",
        date: "2026-01-02",
      } as Transaction,
      {
        id: "tx-2",
        user_id: "user-123",
        account_id: "acc-1",
        type: "expense",
        amount: 200,
        currency: "USD",
        date: "2026-01-03",
      } as Transaction,
    ];

    const balance = calculateAccountBalance(sampleAccount, transactions);
    // 1000 initial + 500 income - 200 expense = 1300
    expect(balance).toBe(1300);
  });

  it("calculates incoming transfer balance correctly", () => {
    const incomingTransfer = [
      {
        id: "tx-3",
        user_id: "user-123",
        account_id: "acc-2", // source is other account
        transfer_account_id: "acc-1", // destination is our account
        type: "transfer",
        amount: 300,
        currency: "USD",
        date: "2026-01-04",
      } as Transaction,
    ];

    const balance = calculateAccountBalance(sampleAccount, incomingTransfer);
    // 1000 initial + 300 incoming transfer = 1300
    expect(balance).toBe(1300);
  });

  it("calculates BDT equivalent balances accurately using exchange rates", () => {
    const transactions: Transaction[] = [];
    const bdtBalance = calculateAccountBdtBalance(sampleAccount, transactions, sampleRates);
    expect(bdtBalance).toBeCloseTo(1000 / 0.00817, 2);
  });

  it("preserves native balance and computes BDT equivalent in getAccountBalanceDetails", () => {
    const details = getAccountBalanceDetails(sampleAccount, [], sampleRates);
    expect(details.native_balance).toBe(1000);
    expect(details.currency_code).toBe("USD");
    expect(details.bdt_equivalent).toBeCloseTo(1000 / 0.00817, 2);
  });

  it("calculates total net worth across multiple accounts converted to BDT", () => {
    const accounts: Account[] = [
      sampleAccount, // 1000 USD -> 122,399.02 BDT
      {
        ...sampleAccount,
        id: "acc-2",
        name: "Local BDT Savings",
        type: "savings",
        balance: 50000,
        currency: "BDT",
        is_active: true,
      },
      {
        ...sampleAccount,
        id: "acc-3",
        name: "Old Archived Account",
        type: "checking",
        balance: 999999,
        currency: "BDT",
        is_active: false,
      },
    ];

    const totalBdt = calculateTotalNetWorthBDT(accounts, [], sampleRates);
    const expected = (1000 / 0.00817) + 50000;
    expect(totalBdt).toBeCloseTo(expected, 2);
  });
});
