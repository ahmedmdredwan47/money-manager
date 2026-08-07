"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AreaChart as AreaChartIcon, PieChart as PieChartIcon } from "lucide-react";

interface ReportsChartsProps {
  periodMode: "monthly" | "yearly" | "category";
  chartSeries: Array<{ label: string; Income: number; Expenses: number }>;
  categoryBreakdown: Array<{ name: string; value: number; color: string }>;
}

export function ReportsCharts({
  periodMode,
  chartSeries,
  categoryBreakdown,
}: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Cash Flow Comparison Chart */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <AreaChartIcon className="h-4 w-4 text-emerald-500" />
            {periodMode === "monthly" ? "Daily Cash Flow Trend" : "Monthly Comparison Trend"}
          </CardTitle>
          <CardDescription className="text-xs">
            Income vs Expenses comparison across the selected timeframe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Category Donut Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-teal-500" />
            Category Distribution
          </CardTitle>
          <CardDescription className="text-xs">Share of total financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 max-h-24 overflow-y-auto scrollbar-none">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs truncate">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-muted-foreground truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
