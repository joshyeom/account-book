"use client";

import { memo } from "react";

// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, ScrollArea } from "@/components/ui";

import { ExpenseWithCategory } from "@/types/database";

import { ExpenseItem } from "./ExpenseItem";

type ExpenseListProps = {
  expenses: ExpenseWithCategory[];
  title?: string;
};

// rerender-memo: 불필요한 리렌더링 방지를 위한 메모이제이션
export const ExpenseList = memo(({ expenses, title = "최근 거래" }: ExpenseListProps) => {
  // rendering-conditional-render: 조건부 렌더링에 삼항 연산자 사용
  const isEmpty = expenses.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      {isEmpty ? (
        <CardContent>
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
            <Receipt className="mb-2 h-12 w-12 opacity-50" />
            <p>거래 내역이 없습니다</p>
            <p className="text-sm">스크린샷을 업로드해서 추가해보세요</p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            {expenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
});
