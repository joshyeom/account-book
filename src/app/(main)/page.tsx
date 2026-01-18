import Link from "next/link";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { ExpenseChart, ExpenseList, SummaryCards } from "@/components/expense";
import { Button } from "@/components/ui";

import { ExpenseWithCategory } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // server-parallel-fetching: 월 시작일 계산은 동기 작업이므로 먼저 수행
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // server-parallel-fetching: 데이터 페칭 (단일 쿼리로 최적화)
  const { data: transactions } = await supabase
    .from("expenses")
    .select(
      `
      id,
      name,
      amount,
      date,
      type,
      category:categories(id, name, icon, color)
    `
    )
    .eq("user_id", user.id)
    .gte("date", format(startOfMonth, "yyyy-MM-dd"))
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const transactionsWithCategory = (transactions ?? []) as ExpenseWithCategory[];
  const currentMonth = format(new Date(), "M월", { locale: ko });

  // Calculate totals
  const totalIncome = transactionsWithCategory
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactionsWithCategory
    .filter((t) => t.type === "expense" || !t.type) // backward compatibility
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactionsWithCategory.filter((t) => t.type === "expense" || !t.type);

  return (
    <div className="space-y-6 pb-24">
      {/* Month Title */}
      <div>
        <h2 className="text-2xl font-bold">{currentMonth}</h2>
      </div>

      {/* Summary Cards */}
      <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

      {/* Chart */}
      <ExpenseChart expenses={expenses} />

      {/* Recent Transactions */}
      <ExpenseList expenses={transactionsWithCategory} title="최근 거래" />

      {/* FAB */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3">
        <Link href="/add">
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
