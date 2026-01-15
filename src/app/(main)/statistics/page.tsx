import { createClient } from "@/lib/supabase/server";

import { StatisticsClient } from "@/components/statistics";

export default async function StatisticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all transactions for the user (client will filter by period)
  const { data: transactions } = await supabase
    .from("expenses")
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return <StatisticsClient transactions={transactions || []} />;
}
