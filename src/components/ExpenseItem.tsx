import { getCategoryById, formatCurrency, formatDate, type Expense } from "@/lib/data";

interface ExpenseItemProps {
  expense: Expense;
}

export const ExpenseItem = ({ expense }: ExpenseItemProps) => {
  const category = getCategoryById(expense.category);
  const Icon = category?.icon;

  return (
    <div className="flex items-center gap-4 rounded-lg bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${category?.color}20` }}
      >
        {Icon && <Icon className="h-6 w-6" style={{ color: category?.color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-card-foreground truncate">{expense.name}</p>
        <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
      </div>
      <p className="text-lg font-semibold text-primary">
        -{formatCurrency(expense.amount)}
      </p>
    </div>
  );
};
