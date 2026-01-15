"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { Edit2, Filter, HelpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ICON_MAP, formatCurrency, formatDate } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

import { Category, ExpenseWithCategory, TransactionType } from "@/types/database";

import { TransactionEditDialog } from "./TransactionEditDialog";

type TransactionsClientProps = {
  initialTransactions: ExpenseWithCategory[];
  categories: Category[];
};

type FilterType = "all" | "income" | "expense";

export function TransactionsClient({ initialTransactions, categories }: TransactionsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseWithCategory | null>(null);
  const [editTarget, setEditTarget] = useState<ExpenseWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        // Type filter
        if (filterType === "income" && t.type !== "income") return false;
        if (filterType === "expense" && t.type !== "expense" && t.type) return false;

        // Category filter
        if (filterCategoryId && t.category_id !== filterCategoryId) return false;

        return true;
      }),
    [transactions, filterType, filterCategoryId]
  );

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, ExpenseWithCategory[]> = {};
    filteredTransactions.forEach((t) => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", deleteTarget.id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("거래가 삭제되었습니다");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = (updatedTransaction: ExpenseWithCategory) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    router.refresh();
  };

  // Get unique categories from transactions for filter
  const transactionCategories = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    transactions.forEach((t) => {
      if (t.category) {
        categoryMap.set(t.category.id, t.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [transactions]);

  return (
    <div className="space-y-4 pb-24">
      {/* Filter Tabs */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="expense">지출</TabsTrigger>
          <TabsTrigger value="income">수입</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {filterCategoryId
                ? transactionCategories.find((c) => c.id === filterCategoryId)?.name
                : "카테고리 필터"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterCategoryId(null)}>
              전체 카테고리
            </DropdownMenuItem>
            {transactionCategories.map((cat) => (
              <DropdownMenuItem key={cat.id} onClick={() => setFilterCategoryId(cat.id)}>
                {cat.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filterCategoryId && (
          <Button variant="ghost" size="sm" onClick={() => setFilterCategoryId(null)}>
            필터 해제
          </Button>
        )}
      </div>

      {/* Transactions List */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            <p>거래 내역이 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([date, items]) => (
            <Card key={date}>
              <CardHeader className="py-3">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {format(new Date(date), "M월 d일 (EEEE)", { locale: ko })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {items.map((transaction) => {
                  const IconComponent = transaction.category?.icon
                    ? ICON_MAP[transaction.category.icon] || HelpCircle
                    : HelpCircle;
                  const categoryColor = transaction.category?.color || "hsl(0, 0%, 50%)";
                  const isIncome = transaction.type === "income";

                  return (
                    <div
                      key={transaction.id}
                      className="group flex items-center gap-3 border-b p-4 last:border-b-0"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${categoryColor}20` }}
                      >
                        <IconComponent className="h-5 w-5" style={{ color: categoryColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{transaction.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {transaction.category?.name || "미분류"}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "text-right font-semibold",
                          isIncome ? "text-primary" : "text-foreground"
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditTarget(transaction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => setDeleteTarget(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거래 삭제</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.name}" 거래를 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editTarget && (
        <TransactionEditDialog
          transaction={editTarget}
          categories={categories}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
