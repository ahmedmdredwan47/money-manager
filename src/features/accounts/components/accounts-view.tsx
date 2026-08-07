"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AccountsList } from "./accounts-list";
import { AccountFormDialog } from "./account-form-dialog";
import { Account } from "@/types";
import { Plus } from "lucide-react";

export function AccountsView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const handleOpenCreate = () => {
    setAccountToEdit(null);
    setDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setAccountToEdit(account);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Wallets"
        description="Manage your Bank accounts, bKash, Nagad, Rocket, Credit Cards, and Physical Cash."
        action={
          <Button variant="gradient" size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        }
      />

      {/* Main Accounts List & Controls */}
      <AccountsList
        onOpenCreateDialog={handleOpenCreate}
        onEditAccount={handleEditAccount}
      />

      {/* Modal Dialog for Create / Edit */}
      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        accountToEdit={accountToEdit}
      />
    </div>
  );
}
