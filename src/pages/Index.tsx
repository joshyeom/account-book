import { useState } from "react";
import { ExpenseChart } from "@/components/ExpenseChart";
import { ExpenseList } from "@/components/ExpenseList";
import { FAB } from "@/components/FAB";
import {
  mockExpenses,
  getCurrentMonth,
  calculateTotalExpenses,
  getExpensesByCategory,
  formatCurrency,
  type Expense,
} from "@/lib/data";

const Index = () => {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const currentMonth = getCurrentMonth();
  const total = calculateTotalExpenses(expenses);
  const expensesByCategory = getExpensesByCategory(expenses);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="bg-primary px-6 pb-8 pt-12">
        <p className="text-primary-foreground/80 text-sm font-medium">
          {currentMonth}
        </p>
        <h1 className="mt-1 text-4xl font-bold text-primary-foreground">
          {formatCurrency(total)}
        </h1>
        <p className="mt-1 text-primary-foreground/60 text-sm">
          Total Expenses
        </p>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24">
        {/* Chart Section */}
        <section className="-mt-4 rounded-2xl bg-card p-4 shadow-md">
          <h2 className="mb-2 text-lg font-semibold text-card-foreground">
            Spending by Category
          </h2>
          <ExpenseChart expensesByCategory={expensesByCategory} total={total} />
        </section>

        {/* Transactions Section */}
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
          <ExpenseList expenses={expenses} />
        </section>
      </main>

      {/* Floating Action Button */}
      <FAB />
    </div>
  );
};

export default Index;
