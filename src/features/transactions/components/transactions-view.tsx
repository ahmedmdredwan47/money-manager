"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TransactionsList } from "./transactions-list";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { TransactionWithCategoryAndAccount } from "@/types";
import { Plus } from "lucide-react";

export function TransactionsView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionWithCategoryAndAccount | null>(null);

  const handleOpenCreate = () => {
    setTransactionToEdit(null);
    setDialogOpen(true);
  };

  const handleEditTransaction = (tx: TransactionWithCategoryAndAccount) => {
    setTransactionToEdit(tx);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction History"
        description="Unified master ledger for Income, Expense, and Account Transfer entries."
        action={
          <Button variant="gradient" size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        }
      />

      {/* Main Transactions List & Filter Toolbar */}
      <TransactionsList
        onOpenCreateDialog={handleOpenCreate}
        onEditTransaction={handleEditTransaction}
      />

      {/* Reusable Form Dialog */}
      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
}
