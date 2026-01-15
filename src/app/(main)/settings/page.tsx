import { createClient } from "@/lib/supabase/server";

import { SettingsClient } from "@/components/settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's custom categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <SettingsClient user={user} customCategories={categories || []} />;
}
