"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SavingsGoalsList } from "./savings-goals-list";
import { SavingsGoalFormDialog } from "./savings-goal-form-dialog";
import { SavingsGoalDepositDialog } from "./savings-goal-deposit-dialog";
import { SavingsGoalWithCalculations } from "../hooks/use-savings-goals";
import { Plus } from "lucide-react";

export function SavingsGoalsView() {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  const [goalToEdit, setGoalToEdit] = useState<SavingsGoalWithCalculations | null>(null);
  const [goalToDeposit, setGoalToDeposit] = useState<SavingsGoalWithCalculations | null>(null);

  const handleOpenCreate = () => {
    setGoalToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoalWithCalculations) => {
    setGoalToEdit(goal);
    setFormDialogOpen(true);
  };

  const handleDepositGoal = (goal: SavingsGoalWithCalculations) => {
    setGoalToDeposit(goal);
    setDepositDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Goals"
        description="Set financial targets, track saved funds, calculate completion dates, and reach your milestones."
        action={
          <Button variant="gradient" size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Savings Goal
          </Button>
        }
      />

      {/* Main Savings Goals List & Visual Charts */}
      <SavingsGoalsList
        onOpenCreateDialog={handleOpenCreate}
        onEditGoal={handleEditGoal}
        onDepositGoal={handleDepositGoal}
      />

      {/* Create / Edit Form Modal */}
      <SavingsGoalFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        goalToEdit={goalToEdit}
      />

      {/* Quick Deposit Modal */}
      <SavingsGoalDepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        goal={goalToDeposit}
      />
    </div>
  );
}
