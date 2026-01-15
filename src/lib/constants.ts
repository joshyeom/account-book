import {
  Banknote,
  Car,
  Coffee,
  Film,
  Gift,
  Heart,
  HelpCircle,
  Home,
  type LucideIcon,
  Plus,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";

import type { CategoryType } from "@/types/database";

export type DefaultCategory = {
  name: string;
  icon: string;
  color: string;
  iconComponent: LucideIcon;
  categoryType: CategoryType;
};

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  {
    name: "식비",
    icon: "Utensils",
    color: "hsl(0, 84%, 60%)",
    iconComponent: Utensils,
    categoryType: "expense",
  },
  {
    name: "교통",
    icon: "Car",
    color: "hsl(25, 95%, 53%)",
    iconComponent: Car,
    categoryType: "expense",
  },
  {
    name: "카페",
    icon: "Coffee",
    color: "hsl(30, 41%, 41%)",
    iconComponent: Coffee,
    categoryType: "expense",
  },
  {
    name: "쇼핑",
    icon: "ShoppingBag",
    color: "hsl(280, 68%, 47%)",
    iconComponent: ShoppingBag,
    categoryType: "expense",
  },
  {
    name: "여가",
    icon: "Film",
    color: "hsl(221, 83%, 53%)",
    iconComponent: Film,
    categoryType: "expense",
  },
  {
    name: "건강",
    icon: "Heart",
    color: "hsl(142, 71%, 45%)",
    iconComponent: Heart,
    categoryType: "expense",
  },
  {
    name: "주거",
    icon: "Home",
    color: "hsl(186, 94%, 37%)",
    iconComponent: Home,
    categoryType: "expense",
  },
  {
    name: "공과금",
    icon: "Zap",
    color: "hsl(48, 96%, 53%)",
    iconComponent: Zap,
    categoryType: "expense",
  },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  {
    name: "월급",
    icon: "Banknote",
    color: "hsl(142, 71%, 45%)",
    iconComponent: Banknote,
    categoryType: "income",
  },
  {
    name: "용돈",
    icon: "Gift",
    color: "hsl(280, 68%, 47%)",
    iconComponent: Gift,
    categoryType: "income",
  },
  {
    name: "이자",
    icon: "TrendingUp",
    color: "hsl(221, 83%, 53%)",
    iconComponent: TrendingUp,
    categoryType: "income",
  },
  {
    name: "기타수입",
    icon: "Plus",
    color: "hsl(186, 94%, 37%)",
    iconComponent: Plus,
    categoryType: "income",
  },
];

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Coffee,
  ShoppingBag,
  Film,
  Heart,
  Home,
  Zap,
  Banknote,
  Gift,
  TrendingUp,
  Plus,
  HelpCircle,
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "오늘";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "어제";
  } else {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
    }).format(date);
  }
}
