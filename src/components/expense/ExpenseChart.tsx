"use client";

import { memo, useMemo } from "react";

import dynamic from "next/dynamic";

import { formatCurrency } from "@/lib/constants";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

import { ExpenseWithCategory } from "@/types/database";

// bundle-dynamic-imports: 무거운 차트 라이브러리를 동적 import로 초기 번들 크기 감소
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });

type ExpenseChartProps = {
  expenses: ExpenseWithCategory[];
};

const ExpenseChartComponent = ({ expenses }: ExpenseChartProps) => {
  const chartData = useMemo(() => {
    const categoryTotals = expenses.reduce(
      (acc, expense) => {
        const categoryName = expense.category?.name || "미분류";
        const color = expense.category?.color || "hsl(0, 0%, 50%)";

        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color };
        }
        acc[categoryName].value += expense.amount;
        return acc;
      },
      {} as Record<string, { name: string; value: number; color: string }>
    );

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalAmount = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">카테고리별 지출</CardTitle>
        <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// rerender-memo: 불필요한 리렌더링 방지를 위한 메모이제이션
export const ExpenseChart = memo(ExpenseChartComponent);
