"use client";

import { memo } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { BarChart3, Home, Receipt, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/statistics", label: "통계", icon: BarChart3 },
  { href: "/transactions", label: "내역", icon: Receipt },
  { href: "/settings", label: "설정", icon: Settings },
];

// rerender-memo: 불필요한 리렌더링 방지를 위한 메모이제이션
export const BottomNav = memo(() => {
  const pathname = usePathname();

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
