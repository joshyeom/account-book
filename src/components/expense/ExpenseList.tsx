'use client'

import { ExpenseWithCategory } from '@/types/database'
import { ExpenseItem } from './ExpenseItem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Receipt } from 'lucide-react'

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
  title?: string
}

export function ExpenseList({ expenses, title = '최근 지출' }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Receipt className="w-12 h-12 mb-2 opacity-50" />
            <p>지출 내역이 없습니다</p>
            <p className="text-sm">영수증을 촬영해서 추가해보세요</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          {expenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
