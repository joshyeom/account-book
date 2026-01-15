import { AddExpenseForm } from "@/components/expense";
import { Header } from "@/components/layout";

export default function AddExpensePage() {
  return (
    <div className="space-y-6">
      <Header title="지출 추가" showBack />
      <AddExpenseForm />
    </div>
  );
}
