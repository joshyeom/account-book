import Link from "next/link";
import { redirect } from "next/navigation";

// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { BottomNav, UserMenu } from "@/components/layout";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Wallet className="text-primary h-6 w-6" />
            <span className="font-semibold">딸깍 가계부</span>
          </Link>
          <UserMenu user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">{children}</main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
