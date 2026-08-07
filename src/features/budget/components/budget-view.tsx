"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { BudgetList } from "./budget-list";
import { BudgetFormDialog } from "./budget-form-dialog";
import { BudgetWithCalculations } from "../hooks/use-budgets";
import { Plus } from "lucide-react";

export function BudgetView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetWithCalculations | null>(null);

  const handleOpenCreate = () => {
    setBudgetToEdit(null);
    setDialogOpen(true);
  };

  const handleEditBudget = (budget: BudgetWithCalculations) => {
    setBudgetToEdit(budget);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Budgets"
        description="Set category spending limits, track real-time expenses, and keep spending under control."
        action={
          <Button variant="gradient" size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Set Budget Limit
          </Button>
        }
      />

      {/* Main Budget List & Progress Grid */}
      <BudgetList
        onOpenCreateDialog={handleOpenCreate}
        onEditBudget={handleEditBudget}
      />

      {/* Modal Form Dialog */}
      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
}
