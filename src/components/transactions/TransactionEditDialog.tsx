"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, ICON_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";

import { Category, ExpenseWithCategory, TransactionType } from "@/types/database";

const editSchema = z.object({
  name: z.string().min(1, "항목명을 입력해주세요"),
  amount: z.number().min(1, "금액을 입력해주세요"),
  date: z.date(),
});

type EditFormData = z.infer<typeof editSchema>;

type TransactionEditDialogProps = {
  transaction: ExpenseWithCategory;
  categories: Category[];
  onClose: () => void;
  onSave: (updated: ExpenseWithCategory) => void;
};

export const TransactionEditDialog = ({
  transaction,
  categories,
  onClose,
  onSave,
}: TransactionEditDialogProps) => {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction.type || "expense"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    transaction.category_id || ""
  );

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: transaction.name,
      amount: transaction.amount,
      date: new Date(transaction.date),
    },
  });

  // Filter categories by transaction type
  const filteredCategories = categories.filter((c) => {
    const categoryType = (c as Category & { category_type?: string }).category_type;
    if (categoryType) {
      return categoryType === transactionType || categoryType === "both";
    }
    if (transactionType === "income") {
      return DEFAULT_INCOME_CATEGORIES.some((ic) => ic.name === c.name);
    }
    return DEFAULT_EXPENSE_CATEGORIES.some((ec) => ec.name === c.name) || !c.is_default;
  });

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    try {
      const { data: updated, error } = await supabase
        .from("expenses")
        .update({
          name: data.name,
          amount: data.amount,
          type: transactionType,
          date: format(data.date, "yyyy-MM-dd"),
          category_id: selectedCategoryId || null,
        } as never)
        .eq("id", transaction.id)
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .single();

      if (error) throw error;

      toast.success("거래가 수정되었습니다");
      onSave(updated as ExpenseWithCategory);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("수정에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>거래 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTransactionType("expense");
                setSelectedCategoryId("");
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
                transactionType === "expense"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border hover:border-destructive/50"
              )}
            >
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium">지출</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionType("income");
                setSelectedCategoryId("");
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
                transactionType === "income"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">수입</span>
            </button>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">항목명</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-destructive text-sm">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>날짜</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("date") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date")
                    ? format(form.watch("date"), "PPP", { locale: ko })
                    : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((category) => {
                const Icon = ICON_MAP[category.icon];
                const isSelected = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {Icon && <Icon className="h-3 w-3" style={{ color: category.color }} />}
                    </div>
                    <span className="text-xs">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
