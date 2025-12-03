import { ExpenseItem } from "./ExpenseItem";
import { type Expense } from "@/lib/data";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No expenses recorded
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  );
};
