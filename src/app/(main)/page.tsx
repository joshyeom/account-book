import { createClient } from '@/lib/supabase/server'
import { ExpenseList } from '@/components/expense/ExpenseList'
import { ExpenseChart } from '@/components/expense/ExpenseChart'
import { Button } from '@/components/ui/button'
import { Plus, Camera } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get current month's expenses
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .gte('date', format(startOfMonth, 'yyyy-MM-dd'))
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const expensesWithCategory = expenses || []
  const currentMonth = format(new Date(), 'M월', { locale: ko })

  return (
    <div className="space-y-6 pb-24">
      {/* Month Title */}
      <div>
        <h2 className="text-2xl font-bold">{currentMonth} 지출</h2>
      </div>

      {/* Chart */}
      <ExpenseChart expenses={expensesWithCategory} />

      {/* Expense List */}
      <ExpenseList expenses={expensesWithCategory} title="최근 지출" />

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Link href="/add">
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
