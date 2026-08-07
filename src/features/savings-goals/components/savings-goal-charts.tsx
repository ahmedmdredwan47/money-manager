"use client";

import React from "react";
import { SavingsGoalWithCalculations } from "../hooks/use-savings-goals";
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
} from "recharts";
import { BarChart3 } from "lucide-react";

interface SavingsGoalChartsProps {
  goals: SavingsGoalWithCalculations[];
}

export function SavingsGoalCharts({ goals }: SavingsGoalChartsProps) {
  const chartData = goals.map((g) => ({
    name: g.title,
    Saved: g.current_amount,
    Target: g.target_amount,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          Target vs Saved Amount Comparison
        </CardTitle>
        <CardDescription className="text-xs">
          Visual comparison of goal targets against accumulated savings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Saved" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Target" fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
