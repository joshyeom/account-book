import { 
  Utensils, 
  Car, 
  Coffee, 
  ShoppingBag, 
  Gamepad2, 
  Pill, 
  Home, 
  Zap,
  type LucideIcon
} from "lucide-react";

export interface Expense {
  id: string;
  amount: number;
  name: string;
  category: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const categories: Category[] = [
  { id: "food", name: "Food", icon: Utensils, color: "hsl(0, 72%, 51%)" },
  { id: "transport", name: "Transport", icon: Car, color: "hsl(24, 95%, 53%)" },
  { id: "coffee", name: "Coffee", icon: Coffee, color: "hsl(30, 50%, 40%)" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "hsl(262, 83%, 58%)" },
  { id: "entertainment", name: "Entertainment", icon: Gamepad2, color: "hsl(217, 91%, 60%)" },
  { id: "health", name: "Health", icon: Pill, color: "hsl(142, 71%, 45%)" },
  { id: "housing", name: "Housing", icon: Home, color: "hsl(200, 60%, 50%)" },
  { id: "utilities", name: "Utilities", icon: Zap, color: "hsl(45, 93%, 47%)" },
];

export const mockExpenses: Expense[] = [
  { id: "1", amount: 6500, name: "스타벅스", category: "coffee", date: "2025-12-03" },
  { id: "2", amount: 45000, name: "마트 장보기", category: "food", date: "2025-12-02" },
  { id: "3", amount: 12000, name: "카카오택시", category: "transport", date: "2025-12-02" },
  { id: "4", amount: 89000, name: "겨울 자켓", category: "shopping", date: "2025-12-01" },
  { id: "5", amount: 17000, name: "넷플릭스 구독", category: "entertainment", date: "2025-12-01" },
  { id: "6", amount: 5500, name: "아침 라떼", category: "coffee", date: "2025-11-30" },
  { id: "7", amount: 65000, name: "친구들과 저녁식사", category: "food", date: "2025-11-30" },
  { id: "8", amount: 85000, name: "전기요금", category: "utilities", date: "2025-11-28" },
  { id: "9", amount: 50000, name: "헬스장 회원권", category: "health", date: "2025-11-27" },
  { id: "10", amount: 55000, name: "교통카드 충전", category: "transport", date: "2025-11-26" },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

export const getCurrentMonth = (): string => {
  return new Date().toLocaleDateString("en-US", { month: "long" });
};

export const getExpensesByMonth = (expenses: Expense[], month: number, year: number): Expense[] => {
  return expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const getExpensesByCategory = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
};

export const getUniqueExpenseNames = (expenses: Expense[]): string[] => {
  return [...new Set(expenses.map((e) => e.name))];
};
