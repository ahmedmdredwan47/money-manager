"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CategoriesList } from "./categories-list";
import { CategoryFormDialog } from "./category-form-dialog";
import { Category } from "@/types";
import { Plus } from "lucide-react";

export function CategoriesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Manager"
        description="Organize income, expenses, and transfers with customizable tags, icons, and color schemes."
        action={
          <Button variant="gradient" size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Category
          </Button>
        }
      />

      {/* Main Categories List & Filters */}
      <CategoriesList
        onOpenCreateDialog={handleOpenCreate}
        onEditCategory={handleEditCategory}
      />

      {/* Modal Form Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
}
