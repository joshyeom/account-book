/**
 * 백엔드 컨벤션 예시 - API Route
 *
 * 이 파일은 프로젝트의 백엔드 컨벤션을 따르는 예시 API Route입니다.
 * 실제 프로젝트에 추가하지 말고, 참고용으로만 사용하세요.
 *
 * 파일 위치: app/api/expenses/route.ts (예시)
 */

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * 타입 정의 - 파일 상단에 위치
 */
type CreateExpenseRequest = {
  name: string;
  amount: number;
  categoryId: string;
  date: string;
  type: "income" | "expense";
};

type ExpenseResponse = {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string;
  type: string;
  createdAt: string;
};

type ErrorResponse = {
  error: string;
};

/**
 * GET /api/expenses
 * 지출 목록 조회
 *
 * Query Parameters:
 * - startDate (optional): 시작 날짜 (YYYY-MM-DD)
 * - endDate (optional): 종료 날짜 (YYYY-MM-DD)
 * - type (optional): income | expense
 */
export const GET = async (request: NextRequest) => {
  try {
    // 1. 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Query Parameters 읽기
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");

    // 3. 데이터베이스 쿼리 (필터 조건 추가)
    let query = supabase
      .from("expenses")
      .select(
        `
        id,
        name,
        amount,
        date,
        type,
        category_id,
        created_at,
        category:categories(id, name, icon, color)
      `
      )
      .eq("user_id", user.id); // RLS: 본인 데이터만 조회

    // 선택적 필터 적용
    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query.order("date", { ascending: false });

    if (error) {
      throw error;
    }

    // 4. 성공 응답
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    // 5. 에러 처리
    console.error("GET /api/expenses error:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
};

/**
 * POST /api/expenses
 * 새 지출 생성
 */
export const POST = async (request: NextRequest) => {
  try {
    // 1. 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Request Body 읽기 및 검증
    const body: CreateExpenseRequest = await request.json();

    // 필수 필드 검증
    if (!body.name || !body.amount || !body.categoryId || !body.date) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing required fields: name, amount, categoryId, date" },
        { status: 400 }
      );
    }

    // 금액 검증
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // 타입 검증
    if (body.type && !["income", "expense"].includes(body.type)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Type must be either 'income' or 'expense'" },
        { status: 400 }
      );
    }

    // 3. 데이터베이스 작업
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        name: body.name,
        amount: body.amount,
        category_id: body.categoryId,
        date: body.date,
        type: body.type ?? "expense",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 4. 성공 응답 (201 Created)
    return NextResponse.json<ExpenseResponse>(
      {
        id: data.id,
        name: data.name,
        amount: data.amount,
        categoryId: data.category_id,
        date: data.date,
        type: data.type,
        createdAt: data.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    // 5. 에러 처리
    console.error("POST /api/expenses error:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
};

/**
 * PATCH /api/expenses/[id]
 * 지출 수정
 *
 * 파일 위치: app/api/expenses/[id]/route.ts (예시)
 */
export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1. 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Request Body 읽기
    const body = await request.json();

    // 3. 기존 데이터 확인 (권한 체크)
    const { data: existing, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id) // 본인 데이터만 수정 가능
      .single();

    if (fetchError || !existing) {
      return NextResponse.json<ErrorResponse>({ error: "Expense not found" }, { status: 404 });
    }

    // 4. 데이터 수정
    const { data, error } = await supabase
      .from("expenses")
      .update({
        name: body.name ?? existing.name,
        amount: body.amount ?? existing.amount,
        category_id: body.categoryId ?? existing.category_id,
        date: body.date ?? existing.date,
        type: body.type ?? existing.type,
      })
      .eq("id", params.id)
      .eq("user_id", user.id) // RLS 이중 체크
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 5. 성공 응답
    return NextResponse.json({ data });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/expenses/[id]
 * 지출 삭제
 */
export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1. 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 데이터 삭제
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id); // 본인 데이터만 삭제 가능

    if (error) {
      throw error;
    }

    // 3. 성공 응답 (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
};
