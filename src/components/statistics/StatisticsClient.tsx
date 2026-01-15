"use client";

import { useCallback, useMemo, useState } from "react";

import dynamic from "next/dynamic";

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { ko } from "date-fns/locale";
// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

import { ICON_MAP, formatCurrency } from "@/lib/constants";

import { SummaryCards } from "@/components/expense";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

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

type Period = "day" | "week" | "month" | "year";

type StatisticsClientProps = {
  transactions: ExpenseWithCategory[];
};

export function StatisticsClient({ transactions }: StatisticsClientProps) {
  const [period, setPeriod] = useState<Period>("month");
  const [offset, setOffset] = useState(0); // 0 = current, -1 = previous, etc.

  // Calculate date range based on period and offset
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let label: string;

    switch (period) {
      case "day":
        start = startOfDay(subDays(now, -offset));
        end = endOfDay(start);
        label = format(start, "M월 d일", { locale: ko });
        break;
      case "week":
        start = startOfWeek(subWeeks(now, -offset), { weekStartsOn: 1 });
        end = endOfWeek(start, { weekStartsOn: 1 });
        label = `${format(start, "M/d", { locale: ko })} - ${format(end, "M/d", { locale: ko })}`;
        break;
      case "month":
        start = startOfMonth(subMonths(now, -offset));
        end = endOfMonth(start);
        label = format(start, "yyyy년 M월", { locale: ko });
        break;
      case "year":
        start = startOfYear(subYears(now, -offset));
        end = endOfYear(start);
        label = format(start, "yyyy년", { locale: ko });
        break;
    }

    return { start, end, label };
  }, [period, offset]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const date = new Date(t.date);
        return date >= dateRange.start && date <= dateRange.end;
      }),
    [transactions, dateRange]
  );

  // Calculate totals
  const { totalIncome, totalExpense, expensesByCategory, incomesByCategory } = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter((t) => t.type === "expense" || !t.type)
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category for expenses
    const expenseCategoryTotals = filteredTransactions
      .filter((t) => t.type === "expense" || !t.type)
      .reduce(
        (acc, t) => {
          const categoryName = t.category?.name || "미분류";
          const color = t.category?.color || "hsl(0, 0%, 50%)";
          const icon = t.category?.icon || "HelpCircle";

          if (!acc[categoryName]) {
            acc[categoryName] = { name: categoryName, value: 0, color, icon };
          }
          acc[categoryName].value += t.amount;
          return acc;
        },
        {} as Record<string, { name: string; value: number; color: string; icon: string }>
      );

    // Group by category for income
    const incomeCategoryTotals = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce(
        (acc, t) => {
          const categoryName = t.category?.name || "미분류";
          const color = t.category?.color || "hsl(0, 0%, 50%)";
          const icon = t.category?.icon || "HelpCircle";

          if (!acc[categoryName]) {
            acc[categoryName] = { name: categoryName, value: 0, color, icon };
          }
          acc[categoryName].value += t.amount;
          return acc;
        },
        {} as Record<string, { name: string; value: number; color: string; icon: string }>
      );

    return {
      totalIncome: income,
      totalExpense: expense,
      expensesByCategory: Object.values(expenseCategoryTotals).sort((a, b) => b.value - a.value),
      incomesByCategory: Object.values(incomeCategoryTotals).sort((a, b) => b.value - a.value),
    };
  }, [filteredTransactions]);

  // rerender-functional-setstate: useCallback으로 함수 참조 안정화
  const handlePrevious = useCallback(() => setOffset((prev) => prev - 1), []);
  const handleNext = useCallback(() => setOffset((prev) => Math.min(prev + 1, 0)), []);
  const handlePeriodChange = useCallback((v: string) => {
    setPeriod(v as Period);
    setOffset(0);
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* Period Selector */}
      <div className="space-y-4">
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="day">일</TabsTrigger>
            <TabsTrigger value="week">주</TabsTrigger>
            <TabsTrigger value="month">월</TabsTrigger>
            <TabsTrigger value="year">년</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">{dateRange.label}</h2>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={offset >= 0}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

      {/* Expense Chart */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="text-destructive h-5 w-5" />
              카테고리별 지출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
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

            {/* Category List */}
            <div className="mt-4 space-y-2">
              {expensesByCategory.map((cat) => {
                const Icon = ICON_MAP[cat.icon];
                const percentage =
                  totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {Icon && <Icon className="h-4 w-4" style={{ color: cat.color }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground text-sm">{percentage}%</span>
                      </div>
                      <div className="bg-muted mt-1 h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                    <span className="w-24 text-right font-semibold">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Chart */}
      {incomesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="text-primary h-5 w-5" />
              카테고리별 수입
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incomesByCategory.map((entry, index) => (
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

            {/* Category List */}
            <div className="mt-4 space-y-2">
              {incomesByCategory.map((cat) => {
                const Icon = ICON_MAP[cat.icon];
                const percentage =
                  totalIncome > 0 ? Math.round((cat.value / totalIncome) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {Icon && <Icon className="h-4 w-4" style={{ color: cat.color }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground text-sm">{percentage}%</span>
                      </div>
                      <div className="bg-muted mt-1 h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                    <span className="text-primary w-24 text-right font-semibold">
                      +{formatCurrency(cat.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {expensesByCategory.length === 0 && incomesByCategory.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            <p>해당 기간의 거래 내역이 없습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
