"use client";

import { memo, useMemo } from "react";

// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { formatCurrency } from "@/lib/constants";

import { Card, CardContent } from "@/components/ui";

type SummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
};

// rerender-memo: 불필요한 리렌더링 방지를 위한 메모이제이션
export const SummaryCards = memo(({ totalIncome, totalExpense }: SummaryCardsProps) => {
  // rerender-derived-state: 파생 상태를 useMemo로 계산
  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const isPositive = balance >= 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Income */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3">
          <div className="text-primary mb-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">수입</span>
          </div>
          <p className="text-primary text-base font-bold">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>

      {/* Expense */}
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-3">
          <div className="text-destructive mb-1 flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">지출</span>
          </div>
          <p className="text-destructive text-base font-bold">{formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card
        className={
          isPositive ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
        }
      >
        <CardContent className="p-3">
          <div
            className={`mb-1 flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">잔액</span>
          </div>
          <p className={`text-base font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
