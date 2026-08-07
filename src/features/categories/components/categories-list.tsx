"use client";

import React, { useState } from "react";
import { useCategories, useDeleteCategory } from "../hooks/use-categories";
import { CategoryCard } from "./category-card";
import { Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Tags,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Plus,
  Search,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";

interface CategoriesListProps {
  onOpenCreateDialog: () => void;
  onEditCategory: (category: Category) => void;
}

export function CategoriesList({
  onOpenCreateDialog,
  onEditCategory,
}: CategoriesListProps) {
  const { data: categories, isLoading, isError, error } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "expense" | "income" | "transfer">("all");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full rounded-2xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-6 text-center text-rose-500">
          <p className="font-semibold">Failed to load categories</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const allCategories = categories || [];

  // Filter categories
  const filteredCategories = allCategories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab !== "all" && cat.type !== activeTab) return false;
    return true;
  });

  const expenseCount = allCategories.filter((c) => c.type === "expense").length;
  const incomeCount = allCategories.filter((c) => c.type === "income").length;
  const transferCount = allCategories.filter((c) => c.type === "transfer").length;

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Categories
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Tags className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {allCategories.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">System defaults & custom tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expense Categories
            </CardTitle>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {expenseCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outflow spending tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Income Categories
            </CardTitle>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {incomeCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Revenue stream tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-muted/60 border border-border/50">
          {[
            { id: "all", label: `All (${allCategories.length})` },
            { id: "expense", label: `Expenses (${expenseCount})` },
            { id: "income", label: `Income (${incomeCount})` },
            { id: "transfer", label: `Transfers (${transferCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={onEditCategory}
              onDelete={(id) => setCategoryToDelete(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center p-8 border-dashed border-border/70">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg font-bold">No Categories Found</CardTitle>
          <CardDescription className="max-w-sm mx-auto mt-1 mb-6">
            {searchQuery || activeTab !== "all"
              ? "No categories match your search or active filter."
              : "Create custom tags for your unique spending and income streams."}
          </CardDescription>
          <Button variant="gradient" onClick={onOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Create Category Now
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Delete Category?"
        description="Are you sure you want to delete this custom category? Existing transactions using this category will remain intact."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setCategoryToDelete(null)}
            disabled={deleteCategoryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteCategoryMutation.isPending}
          >
            {deleteCategoryMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Confirm Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
