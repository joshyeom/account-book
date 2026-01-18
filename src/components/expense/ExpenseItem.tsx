"use client";

import { HelpCircle } from "lucide-react";

import { ICON_MAP, formatCurrency, formatDate } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { ExpenseWithCategory } from "@/types/database";

type ExpenseItemProps = {
  expense: ExpenseWithCategory;
};

export const ExpenseItem = ({ expense }: ExpenseItemProps) => {
  const IconComponent = expense.category?.icon
    ? ICON_MAP[expense.category.icon] || HelpCircle
    : HelpCircle;

  const categoryColor = expense.category?.color || "hsl(0, 0%, 50%)";
  const isIncome = expense.type === "income";

  return (
    <div className="flex items-center gap-3 border-b p-4 last:border-b-0">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <IconComponent className="h-5 w-5" style={{ color: categoryColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{expense.name}</p>
        <p className="text-muted-foreground text-sm">
          {expense.category?.name || "미분류"} • {formatDate(expense.date)}
        </p>
      </div>
      <p className={cn("text-right font-semibold", isIncome ? "text-primary" : "text-foreground")}>
        {isIncome ? "+" : "-"}
        {formatCurrency(expense.amount)}
      </p>
    </div>
  );
};
