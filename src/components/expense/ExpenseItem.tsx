'use client'

import { formatCurrency, formatDate, ICON_MAP } from '@/lib/constants'
import { ExpenseWithCategory } from '@/types/database'
import { HelpCircle } from 'lucide-react'

interface ExpenseItemProps {
  expense: ExpenseWithCategory
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const IconComponent = expense.category?.icon
    ? ICON_MAP[expense.category.icon] || HelpCircle
    : HelpCircle

  const categoryColor = expense.category?.color || 'hsl(0, 0%, 50%)'

  return (
    <div className="flex items-center gap-3 p-4 border-b last:border-b-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <IconComponent
          className="w-5 h-5"
          style={{ color: categoryColor }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{expense.name}</p>
        <p className="text-sm text-muted-foreground">
          {expense.category?.name || '미분류'} • {formatDate(expense.date)}
        </p>
      </div>
      <p className="font-semibold text-right">
        {formatCurrency(expense.amount)}
      </p>
    </div>
  )
}
