/**
 * 백엔드 컨벤션 예시 - Server Component
 *
 * 이 파일은 프로젝트의 백엔드 컨벤션을 따르는 예시 서버 컴포넌트입니다.
 * 실제 프로젝트에 추가하지 말고, 참고용으로만 사용하세요.
 *
 * 파일 위치: app/(main)/expenses/page.tsx (예시)
 */

import { redirect } from "next/navigation";

import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { createClient } from "@/lib/supabase/server";

import { ExpenseList } from "@/components/expense";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

import type { ExpenseWithCategory } from "@/types/database";

/**
 * 서버 컴포넌트 - 기본 패턴
 *
 * 특징:
 * - async function 사용 가능
 * - 서버에서 실행되므로 DB 직접 접근 가능
 * - useState, useEffect 같은 클라이언트 훅 사용 불가
 * - onClick 같은 이벤트 핸들러 사용 불가
 */
export default async function ExpensesPage() {
  // 1. Supabase 서버 클라이언트 생성 (await 필수!)
  const supabase = await createClient();

  // 2. 인증 확인 - Early Return 패턴
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    redirect("/login");
  }

  // 3. 날짜 계산 (동기 작업은 먼저 수행)
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // 4. 데이터 페칭 - 병렬 처리 (성능 최적화)
  const [expensesResult, categoriesResult, statsResult] = await Promise.all([
    // 지출 목록 조회
    supabase
      .from("expenses")
      .select(
        `
        id,
        name,
        amount,
        date,
        type,
        category:categories(id, name, icon, color)
      `
      )
      .eq("user_id", user.id) // RLS: 본인 데이터만
      .gte("date", format(startOfMonth, "yyyy-MM-dd"))
      .lte("date", format(endOfMonth, "yyyy-MM-dd"))
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),

    // 카테고리 목록 조회
    supabase
      .from("categories")
      .select("id, name, icon, color, category_type")
      .or(`user_id.eq.${user.id},is_default.eq.true`),

    // 통계 데이터 조회
    supabase
      .from("expenses")
      .select("amount, type")
      .eq("user_id", user.id)
      .gte("date", format(startOfMonth, "yyyy-MM-dd"))
      .lte("date", format(endOfMonth, "yyyy-MM-dd")),
  ]);

  // 5. 에러 처리
  if (expensesResult.error) {
    console.error("Failed to fetch expenses:", expensesResult.error);
    // 에러 페이지 표시 또는 리다이렉트
    return (
      <div className="p-6">
        <p>데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  // 6. 데이터 변환 및 계산
  const expenses = (expensesResult.data ?? []) as ExpenseWithCategory[];
  const categories = categoriesResult.data ?? [];
  const stats = statsResult.data ?? [];

  const totalIncome = stats
    .filter((s) => s.type === "income")
    .reduce((sum, s) => sum + s.amount, 0);

  const totalExpense = stats
    .filter((s) => s.type === "expense")
    .reduce((sum, s) => sum + s.amount, 0);

  const currentMonth = format(today, "yyyy년 M월", { locale: ko });

  // 7. UI 렌더링
  return (
    <div className="space-y-6 p-6">
      {/* 월 제목 */}
      <h1 className="text-3xl font-bold">{currentMonth}</h1>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>총 수입</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              +{totalIncome.toLocaleString()}원
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              -{totalExpense.toLocaleString()}원
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>잔액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(totalIncome - totalExpense).toLocaleString()}원
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 지출 목록 - 클라이언트 컴포넌트에 데이터 전달 */}
      <ExpenseList expenses={expenses} categories={categories} />
    </div>
  );
}

/**
 * 동적 렌더링 설정
 *
 * force-dynamic: 항상 동적 렌더링 (캐시 사용 안 함)
 * force-static: 항상 정적 렌더링 (빌드 타임에 생성)
 */
// export const dynamic = "force-dynamic";

/**
 * 재검증 주기 설정 (ISR)
 *
 * 60초마다 페이지를 재생성합니다.
 */
// export const revalidate = 60;
