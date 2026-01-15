import { createClient } from "@/lib/supabase/server";

import { TransactionsClient } from "@/components/transactions";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from("expenses")
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch user's categories for editing
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order("is_default", { ascending: false });

  return (
    <TransactionsClient initialTransactions={transactions || []} categories={categories || []} />
  );
}
