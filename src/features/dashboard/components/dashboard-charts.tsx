"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AreaChart as AreaChartIcon, PieChart as PieChartIcon } from "lucide-react";

interface DashboardChartsProps {
  monthlyTrendData: Array<{ month: string; Income: number; Expenses: number }>;
  categoryBreakdownData: Array<{ name: string; value: number; color: string }>;
}

export function DashboardCharts({
  monthlyTrendData,
  categoryBreakdownData,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Cash Flow Overview Area Chart */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AreaChartIcon className="h-5 w-5 text-emerald-500" />
              Cash Flow Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Income vs Expenses over the past 6 months
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            6 Months
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Expenditure Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-teal-500" />
            Spending Distribution
          </CardTitle>
          <CardDescription className="text-xs">Category expenditure shares</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryBreakdownData.map((entry, index) => (
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
            {categoryBreakdownData.map((cat, idx) => (
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
