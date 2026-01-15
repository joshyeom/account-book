"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import {
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { ICON_MAP, formatCurrency } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import {
  Button,
  Calendar,
  Card,
  CardContent,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";

import { Category, CategoryInsert, ExpenseInsert, TransactionType } from "@/types/database";

import {
  type AnalyzedReceiptItem,
  type AnalyzedReceiptResponse,
  ReceiptUpload,
} from "./ReceiptUpload";

type TransactionItem = {
  id: string;
  isEditing: boolean;
  categoryId?: string;
} & AnalyzedReceiptItem;

export function AddExpenseForm() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order("is_default", { ascending: false });

      if (data) {
        setCategories(data);
      }
    };

    loadCategories();
  }, [supabase]);

  const handleReceiptAnalyzed = (data: AnalyzedReceiptResponse) => {
    const newItems: TransactionItem[] = data.items.map((item, index) => {
      // Find matching category
      const existingCategory = categories.find(
        (c) => c.name.toLowerCase() === item.category.toLowerCase()
      );

      return {
        ...item,
        id: `item-${Date.now()}-${index}`,
        isEditing: false,
        categoryId: existingCategory?.id,
      };
    });

    setItems(newItems);
    // Expand first item by default
    if (newItems.length > 0) {
      setExpandedItemId(newItems[0].id);
    }
  };

  const updateItem = (id: string, updates: Partial<TransactionItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItemExpand = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const getCategoryForItem = (item: TransactionItem) => {
    if (item.categoryId) {
      return categories.find((c) => c.id === item.categoryId);
    }
    return categories.find((c) => c.name.toLowerCase() === item.category.toLowerCase());
  };

  const getFilteredCategories = (type: TransactionType) =>
    categories.filter((c) => {
      const categoryType = (c as Category & { category_type?: string }).category_type;
      if (categoryType) {
        return categoryType === type || categoryType === "both";
      }
      return true;
    });

  const onSubmit = async () => {
    if (items.length === 0) {
      toast.error("저장할 항목이 없습니다");
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let successCount = 0;
      const newCategoryIds: Record<string, string> = {};

      for (const item of items) {
        let categoryId = item.categoryId;

        // Create new category if needed
        if (!categoryId && item.isNewCategory) {
          // Check if we already created this category in this batch
          const cacheKey = item.category.toLowerCase();
          if (newCategoryIds[cacheKey]) {
            categoryId = newCategoryIds[cacheKey];
          } else {
            const categoryInsert: CategoryInsert = {
              user_id: user.id,
              name: item.category,
              icon: item.suggestedIcon || "HelpCircle",
              color: item.suggestedColor || "hsl(0, 0%, 50%)",
              is_default: false,
            };
            const { data: newCategory, error: categoryError } = await supabase
              .from("categories")
              .insert(categoryInsert as never)
              .select()
              .single();

            if (categoryError) {
              console.error("Category creation error:", categoryError);
            } else {
              categoryId = (newCategory as Category).id;
              newCategoryIds[cacheKey] = categoryId;
            }
          }
        }

        // Find existing category if not set
        if (!categoryId) {
          const existingCategory = categories.find(
            (c) => c.name.toLowerCase() === item.category.toLowerCase()
          );
          categoryId = existingCategory?.id;
        }

        // Create expense
        const expenseInsert: ExpenseInsert = {
          user_id: user.id,
          name: item.name,
          amount: item.amount,
          type: item.type,
          date: item.date,
          category_id: categoryId || null,
          ai_processed: true,
        };

        const { error } = await supabase.from("expenses").insert(expenseInsert as never);

        if (error) {
          console.error("Expense creation error:", error);
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount}건의 거래가 저장되었습니다`);
        router.push("/");
        router.refresh();
      } else {
        toast.error("저장에 실패했습니다");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpense = items
    .filter((i) => i.type === "expense")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalIncome = items
    .filter((i) => i.type === "income")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Receipt Upload - Primary Action */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <Label className="text-base font-semibold">스크린샷 업로드</Label>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          결제 내역이나 거래 내역 스크린샷을 업로드하면 AI가 자동으로 분석합니다
        </p>
        <ReceiptUpload onAnalyzed={handleReceiptAnalyzed} />
      </div>

      {/* Analyzed Items */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">분석된 거래 내역 ({items.length}건)</Label>
            <div className="flex gap-3 text-sm">
              {totalExpense > 0 && (
                <span className="text-destructive font-medium">
                  지출 {formatCurrency(totalExpense)}
                </span>
              )}
              {totalIncome > 0 && (
                <span className="text-primary font-medium">수입 {formatCurrency(totalIncome)}</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const category = getCategoryForItem(item);
              const Icon = category ? ICON_MAP[category.icon] : null;
              const isExpanded = expandedItemId === item.id;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "overflow-hidden transition-all",
                    item.type === "income"
                      ? "border-l-primary border-l-4"
                      : "border-l-destructive border-l-4"
                  )}
                >
                  <CardContent className="p-0">
                    {/* Summary Row */}
                    <div
                      className="hover:bg-muted/30 flex cursor-pointer items-center gap-3 p-4"
                      onClick={() => toggleItemExpand(item.id)}
                    >
                      {/* Category Icon */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: category ? `${category.color}20` : "hsl(var(--muted))",
                        }}
                      >
                        {Icon ? (
                          <Icon className="h-5 w-5" style={{ color: category?.color }} />
                        ) : item.type === "income" ? (
                          <TrendingUp className="text-primary h-5 w-5" />
                        ) : (
                          <TrendingDown className="text-destructive h-5 w-5" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{item.name}</span>
                          {item.isNewCategory && (
                            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                              새 카테고리
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span>{format(new Date(item.date), "M월 d일", { locale: ko })}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className={cn(
                          "text-right font-semibold",
                          item.type === "income" ? "text-primary" : "text-destructive"
                        )}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </div>

                      {/* Expand Icon */}
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="text-muted-foreground h-5 w-5" />
                        ) : (
                          <ChevronDown className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Edit Section */}
                    {isExpanded && (
                      <div className="bg-muted/20 space-y-4 border-t p-4">
                        {/* Transaction Type */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, { type: "expense" })}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-lg border p-2 transition-colors",
                              item.type === "expense"
                                ? "border-destructive bg-destructive/10 text-destructive"
                                : "border-border hover:border-destructive/50"
                            )}
                          >
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-medium">지출</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, { type: "income" })}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-lg border p-2 transition-colors",
                              item.type === "income"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">수입</span>
                          </button>
                        </div>

                        {/* Name */}
                        <div className="space-y-1.5">
                          <Label className="text-sm">항목명</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          />
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                          <Label className="text-sm">금액</Label>
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) =>
                              updateItem(item.id, { amount: Number(e.target.value) })
                            }
                          />
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                          <Label className="text-sm">날짜</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(item.date), "PPP", { locale: ko })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={new Date(item.date)}
                                onSelect={(date) =>
                                  date &&
                                  updateItem(item.id, {
                                    date: format(date, "yyyy-MM-dd"),
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                          <Label className="text-sm">카테고리</Label>
                          {item.isNewCategory && !item.categoryId ? (
                            <Card className="border-primary">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="flex h-8 w-8 items-center justify-center rounded-full"
                                      style={{ backgroundColor: `${item.suggestedColor}20` }}
                                    >
                                      {(() => {
                                        const NewIcon =
                                          ICON_MAP[item.suggestedIcon || "HelpCircle"];
                                        return NewIcon ? (
                                          <NewIcon
                                            className="h-4 w-4"
                                            style={{ color: item.suggestedColor }}
                                          />
                                        ) : null;
                                      })()}
                                    </div>
                                    <span className="font-medium">{item.category}</span>
                                    <span className="text-primary text-xs">(AI 추천)</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateItem(item.id, { isNewCategory: false })}
                                  >
                                    변경
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {getFilteredCategories(item.type).map((cat) => {
                                const CatIcon = ICON_MAP[cat.icon];
                                const isSelected =
                                  item.categoryId === cat.id ||
                                  (!item.categoryId &&
                                    cat.name.toLowerCase() === item.category.toLowerCase());
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() =>
                                      updateItem(item.id, {
                                        categoryId: cat.id,
                                        category: cat.name,
                                        isNewCategory: false,
                                      })
                                    }
                                    className={cn(
                                      "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                                      isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <div
                                      className="flex h-6 w-6 items-center justify-center rounded-full"
                                      style={{ backgroundColor: `${cat.color}20` }}
                                    >
                                      {CatIcon && (
                                        <CatIcon className="h-3 w-3" style={{ color: cat.color }} />
                                      )}
                                    </div>
                                    <span className="text-xs">{cat.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />이 항목 삭제
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            className="h-12 w-full"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {items.length}건 모두 저장
              </>
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <p>스크린샷을 업로드하면 AI가 자동으로 분석합니다</p>
        </div>
      )}
    </div>
  );
}
