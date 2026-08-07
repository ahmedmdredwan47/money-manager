"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tags, Flame } from "lucide-react";

interface TopCategoryItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface DashboardTopCategoriesProps {
  topCategories: TopCategoryItem[];
}

export function DashboardTopCategories({ topCategories }: DashboardTopCategoriesProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Top Spending Categories
        </CardTitle>
        <CardDescription className="text-xs">Categories with highest expenditure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-foreground">{cat.name}</span>
              </div>
              <span className="font-mono text-muted-foreground">
                {formatCurrency(cat.value, "BDT")} ({cat.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(cat.percentage, 100)}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
