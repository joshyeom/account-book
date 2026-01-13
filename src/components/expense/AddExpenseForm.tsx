'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category, CategoryInsert, ExpenseInsert } from '@/types/database'
import { DEFAULT_CATEGORIES, ICON_MAP } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { ReceiptUpload } from './ReceiptUpload'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const expenseSchema = z.object({
  name: z.string().min(1, '항목명을 입력해주세요'),
  amount: z.number().min(1, '금액을 입력해주세요'),
  date: z.date(),
  categoryId: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface AnalyzedReceipt {
  name: string
  amount: number
  date: string
  category: string
  isNewCategory: boolean
  suggestedIcon?: string
  suggestedColor?: string
}

export function AddExpenseForm() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState<{
    name: string
    icon: string
    color: string
  } | null>(null)

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: 0,
      date: new Date(),
    },
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},is_default.eq.true`)
      .order('is_default', { ascending: false })

    if (data) {
      setCategories(data)
    }
  }

  const handleReceiptAnalyzed = (data: AnalyzedReceipt) => {
    form.setValue('name', data.name)
    form.setValue('amount', data.amount)
    form.setValue('date', new Date(data.date))

    // Find matching category or prepare new one
    const existingCategory = categories.find(
      (c) => c.name.toLowerCase() === data.category.toLowerCase()
    )

    if (existingCategory) {
      setSelectedCategoryId(existingCategory.id)
      setNewCategoryData(null)
    } else if (data.isNewCategory) {
      setSelectedCategoryId('')
      setNewCategoryData({
        name: data.category,
        icon: data.suggestedIcon || 'HelpCircle',
        color: data.suggestedColor || 'hsl(0, 0%, 50%)',
      })
    }
  }

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let categoryId = selectedCategoryId

      // Create new category if needed
      if (newCategoryData && !categoryId) {
        const categoryInsert: CategoryInsert = {
          user_id: user.id,
          name: newCategoryData.name,
          icon: newCategoryData.icon,
          color: newCategoryData.color,
          is_default: false,
        }
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert(categoryInsert as never)
          .select()
          .single()

        if (categoryError) throw categoryError
        categoryId = (newCategory as Category).id
        toast.success(`새 카테고리 "${newCategoryData.name}"가 생성되었습니다`)
      }

      // Create expense
      const expenseInsert: ExpenseInsert = {
        user_id: user.id,
        name: data.name,
        amount: data.amount,
        date: format(data.date, 'yyyy-MM-dd'),
        category_id: categoryId || null,
        ai_processed: !!newCategoryData,
      }
      const { error } = await supabase.from('expenses').insert(expenseInsert as never)

      if (error) throw error

      toast.success('지출이 추가되었습니다')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('지출 추가에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Upload */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          영수증 촬영 (선택)
        </Label>
        <ReceiptUpload onAnalyzed={handleReceiptAnalyzed} />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">항목명</Label>
        <Input
          id="name"
          placeholder="예: 스타벅스"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">금액</Label>
        <Input
          id="amount"
          type="number"
          placeholder="0"
          {...form.register('amount', { valueAsNumber: true })}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
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
                'w-full justify-start text-left font-normal',
                !form.watch('date') && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch('date')
                ? format(form.watch('date'), 'PPP', { locale: ko })
                : '날짜 선택'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={form.watch('date')}
              onSelect={(date) => date && form.setValue('date', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>카테고리</Label>
        {newCategoryData ? (
          <Card className="border-primary">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${newCategoryData.color}20` }}
                  >
                    {(() => {
                      const Icon = ICON_MAP[newCategoryData.icon]
                      return Icon ? (
                        <Icon className="w-4 h-4" style={{ color: newCategoryData.color }} />
                      ) : null
                    })()}
                  </div>
                  <span className="font-medium">{newCategoryData.name}</span>
                  <span className="text-xs text-primary">(AI 추천)</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewCategoryData(null)}
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {categories.map((category) => {
              const Icon = ICON_MAP[category.icon]
              const isSelected = selectedCategoryId === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {Icon && (
                      <Icon className="w-4 h-4" style={{ color: category.color }} />
                    )}
                  </div>
                  <span className="text-xs">{category.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            저장 중...
          </>
        ) : (
          '지출 추가'
        )}
      </Button>
    </form>
  )
}
