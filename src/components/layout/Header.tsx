"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui";

type HeaderProps = {
  title: string;
  showBack?: boolean;
};

export const Header = ({ title, showBack = false }: HeaderProps) => {
  const router = useRouter();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center px-4">
        {showBack && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
