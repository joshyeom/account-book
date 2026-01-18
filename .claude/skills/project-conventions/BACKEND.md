# 백엔드 코딩 컨벤션

AI 가계부 프로젝트의 백엔드(서버 사이드) 코딩 컨벤션입니다.
**주니어 프론트엔드 엔지니어를 위한 가이드**입니다.

---

## 목차

1. [기본 개념](#1-기본-개념)
2. [API Routes 규칙](#2-api-routes-규칙)
3. [Supabase 클라이언트 사용](#3-supabase-클라이언트-사용)
4. [서버 컴포넌트 (Server Components)](#4-서버-컴포넌트-server-components)
5. [에러 처리](#5-에러-처리)
6. [보안 및 인증](#6-보안-및-인증)
7. [성능 최적화](#7-성능-최적화)

---

## 1. 기본 개념

### 1.1 Next.js에서의 백엔드란?

Next.js는 프론트엔드와 백엔드를 함께 다룰 수 있는 풀스택 프레임워크입니다.

**백엔드 코드가 실행되는 곳:**

| 종류                | 실행 위치 | 파일 위치                    | 용도                    |
| ------------------- | --------- | ---------------------------- | ----------------------- |
| API Routes          | 서버      | `app/api/**/route.ts`        | REST API 엔드포인트     |
| Server Components   | 서버      | `app/**/page.tsx` (기본값)   | 페이지 렌더링 + DB 조회 |
| Server Actions      | 서버      | `"use server"` 함수          | 폼 제출, 데이터 변경    |
| Middleware          | 엣지      | `middleware.ts`              | 인증, 리다이렉트        |
| Supabase 클라이언트 | 서버/클라 | `lib/supabase/*.ts`          | DB 접근 래퍼            |

**핵심 차이점:**

```typescript
// ❌ 클라이언트 컴포넌트 - 브라우저에서 실행
"use client";
import { useEffect } from "react";

export const MyComponent = () => {
  useEffect(() => {
    // 여기는 브라우저에서 실행됨
    console.log("브라우저 콘솔에 찍힘");
  }, []);
};

// ✅ 서버 컴포넌트 - 서버에서 실행 (기본값)
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  // 여기는 서버에서 실행됨 (브라우저에서 안 보임)
  console.log("서버 터미널에 찍힘");

  const { data } = await supabase.from("expenses").select("*");
  return <div>{data?.length}개</div>;
}
```

### 1.2 환경 변수

**서버 전용 환경 변수** (절대 클라이언트에 노출 안 됨):

```bash
# .env.local
OPENAI_API_KEY=sk-xxx...  # API Routes에서만 사용 가능
```

**클라이언트 공개 환경 변수** (`NEXT_PUBLIC_` 접두사 필요):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**사용 규칙:**

```typescript
// ✅ 올바른 예
// API Route에서 서버 전용 변수 사용
export const POST = async (request: NextRequest) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 안전함
  });
};

// ❌ 잘못된 예
"use client";
export const MyComponent = () => {
  // 클라이언트에서 서버 전용 변수 접근 불가 (undefined)
  const key = process.env.OPENAI_API_KEY; // undefined!
};
```

---

## 2. API Routes 규칙

### 2.1 파일 구조

```
src/app/api/
├── ai/
│   └── analyze-receipt/
│       └── route.ts          # POST /api/ai/analyze-receipt
└── auth/
    └── callback/
        └── route.ts          # GET /api/auth/callback
```

### 2.2 기본 템플릿

**화살표 함수 표현식 사용** (프로젝트 컨벤션):

```typescript
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// ✅ 올바른 예 - 화살표 함수
export const GET = async (request: NextRequest) => {
  try {
    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 비즈니스 로직
    const { data, error } = await supabase.from("expenses").select("*").eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

// ❌ 잘못된 예 - 함수 선언문
export async function GET(request: NextRequest) {
  // ...
}
```

### 2.3 HTTP 메서드

```typescript
// GET - 데이터 조회
export const GET = async (request: NextRequest) => {};

// POST - 데이터 생성
export const POST = async (request: NextRequest) => {};

// PUT/PATCH - 데이터 수정
export const PATCH = async (request: NextRequest) => {};

// DELETE - 데이터 삭제
export const DELETE = async (request: NextRequest) => {};
```

### 2.4 Request 데이터 읽기

```typescript
// Query Parameters (?name=value)
export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id"); // /api/users?id=123

  return NextResponse.json({ id });
};

// JSON Body
export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { name, amount } = body;

  return NextResponse.json({ name, amount });
};

// FormData (파일 업로드)
export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const image = formData.get("image") as File;

  return NextResponse.json({ fileName: image.name });
};
```

### 2.5 Response 형식

**성공 응답:**

```typescript
// 데이터만 반환
return NextResponse.json({ data: users });

// 상태 코드 명시
return NextResponse.json({ data: user }, { status: 201 }); // Created

// 리다이렉트
return NextResponse.redirect(new URL("/login", request.url));
```

**에러 응답:**

```typescript
// 400 Bad Request - 잘못된 요청
return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

// 401 Unauthorized - 인증 실패
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// 403 Forbidden - 권한 없음
return NextResponse.json({ error: "Forbidden" }, { status: 403 });

// 404 Not Found - 리소스 없음
return NextResponse.json({ error: "User not found" }, { status: 404 });

// 500 Internal Server Error - 서버 에러
return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
```

### 2.6 타입 정의

**응답 타입을 파일 상단에 정의:**

```typescript
import { NextRequest, NextResponse } from "next/server";

// 타입 정의
type CreateExpenseRequest = {
  name: string;
  amount: number;
  categoryId: string;
  date: string;
};

type CreateExpenseResponse = {
  id: string;
  name: string;
  amount: number;
};

type ErrorResponse = {
  error: string;
};

// API 핸들러
export const POST = async (request: NextRequest) => {
  const body: CreateExpenseRequest = await request.json();

  // ... 로직

  return NextResponse.json<CreateExpenseResponse>({
    id: "123",
    name: body.name,
    amount: body.amount,
  });
};
```

---

## 3. Supabase 클라이언트 사용

### 3.1 클라이언트 종류

**3가지 클라이언트가 있습니다:**

| 클라이언트           | 파일 위치                   | 사용 위치                      |
| -------------------- | --------------------------- | ------------------------------ |
| Server Client        | `lib/supabase/server.ts`    | 서버 컴포넌트, API Routes      |
| Browser Client       | `lib/supabase/client.ts`    | 클라이언트 컴포넌트            |
| Middleware Client    | `lib/supabase/middleware.ts`| Middleware                     |

### 3.2 올바른 클라이언트 선택

```typescript
// ✅ 서버 컴포넌트에서
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient(); // await 필요!
  const { data } = await supabase.from("expenses").select("*");
}

// ✅ API Route에서
import { createClient } from "@/lib/supabase/server";

export const GET = async (request: NextRequest) => {
  const supabase = await createClient(); // await 필요!
  const { data } = await supabase.from("expenses").select("*");
};

// ✅ 클라이언트 컴포넌트에서
"use client";
import { createClient } from "@/lib/supabase/client";

export const MyComponent = () => {
  const supabase = createClient(); // await 불필요
  const handleClick = async () => {
    const { data } = await supabase.from("expenses").select("*");
  };
};
```

### 3.3 CRUD 패턴

**조회 (Read):**

```typescript
// 전체 조회
const { data, error } = await supabase.from("expenses").select("*");

// 조건 조회
const { data, error } = await supabase
  .from("expenses")
  .select("*")
  .eq("user_id", userId) // WHERE user_id = userId
  .gte("amount", 1000) // WHERE amount >= 1000
  .order("date", { ascending: false }); // ORDER BY date DESC

// 조인 (Join)
const { data, error } = await supabase.from("expenses").select(`
    id,
    name,
    amount,
    category:categories(id, name, icon, color)
  `);

// 단일 조회
const { data, error } = await supabase.from("expenses").select("*").eq("id", expenseId).single();
```

**생성 (Create):**

```typescript
const { data, error } = await supabase.from("expenses").insert({
  user_id: userId,
  name: "커피",
  amount: 5000,
  category_id: categoryId,
  date: "2024-01-15",
});
```

**수정 (Update):**

```typescript
const { data, error } = await supabase
  .from("expenses")
  .update({
    name: "아메리카노",
    amount: 4500,
  })
  .eq("id", expenseId);
```

**삭제 (Delete):**

```typescript
const { data, error } = await supabase.from("expenses").delete().eq("id", expenseId);
```

### 3.4 에러 처리

```typescript
const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single();

// ✅ 올바른 에러 처리
if (error) {
  console.error("Supabase error:", error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// data가 null일 수 있으므로 체크
if (!data) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

return NextResponse.json({ data });
```

---

## 4. 서버 컴포넌트 (Server Components)

### 4.1 기본 개념

서버 컴포넌트는 서버에서 실행되어 HTML을 생성하고 클라이언트로 보냅니다.

**장점:**

- 데이터베이스 직접 접근 가능
- API Key 같은 비밀 정보 안전하게 사용
- 번들 크기 감소 (서버에서만 실행되는 코드는 클라이언트로 안 감)

**서버 컴포넌트 특징:**

```typescript
// app/page.tsx - 서버 컴포넌트 (기본값)
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  // ✅ async 함수 가능
  // ✅ DB 직접 조회 가능
  // ❌ useState, useEffect 같은 훅 사용 불가
  // ❌ onClick 같은 이벤트 핸들러 불가

  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("*");

  return <div>{data?.length}개</div>;
}
```

### 4.2 데이터 페칭 패턴

**Early Return 패턴:**

```typescript
export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ 인증 체크
  if (!user) return null;

  // 메인 로직
  const { data } = await supabase.from("expenses").select("*").eq("user_id", user.id);

  return <div>{/* UI */}</div>;
}
```

**병렬 페칭 (중요!):**

```typescript
// ❌ 나쁜 예 - 순차 실행 (느림)
const { data: user } = await supabase.from("users").select("*").single();
const { data: expenses } = await supabase.from("expenses").select("*"); // user 이후 실행
const { data: categories } = await supabase.from("categories").select("*"); // expenses 이후 실행

// ✅ 좋은 예 - 병렬 실행 (빠름)
const [
  { data: user },
  { data: expenses },
  { data: categories }
] = await Promise.all([
  supabase.from("users").select("*").single(),
  supabase.from("expenses").select("*"),
  supabase.from("categories").select("*"),
]);
```

### 4.3 서버/클라이언트 컴포넌트 조합

```typescript
// app/page.tsx - 서버 컴포넌트
import { createClient } from "@/lib/supabase/server";

import { ExpenseList } from "@/components/expense"; // 클라이언트 컴포넌트

export default async function Page() {
  const supabase = await createClient();
  const { data: expenses } = await supabase.from("expenses").select("*");

  // ✅ 서버에서 데이터 조회 후 클라이언트 컴포넌트에 props로 전달
  return <ExpenseList expenses={expenses ?? []} />;
}
```

```typescript
// components/expense/ExpenseList.tsx - 클라이언트 컴포넌트
"use client";

import { useState } from "react";

type Props = {
  expenses: Expense[];
};

export const ExpenseList = ({ expenses }: Props) => {
  const [filter, setFilter] = useState("");

  // ✅ 클라이언트에서 상태 관리 및 인터랙션 처리
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {expenses.filter((e) => e.name.includes(filter)).map((e) => (
        <div key={e.id}>{e.name}</div>
      ))}
    </div>
  );
};
```

---

## 5. 에러 처리

### 5.1 Try-Catch 패턴

**API Routes에서:**

```typescript
export const POST = async (request: NextRequest) => {
  try {
    // 1. 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 요청 검증
    const body = await request.json();
    if (!body.name || !body.amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. DB 작업
    const { data, error } = await supabase.from("expenses").insert({
      user_id: user.id,
      name: body.name,
      amount: body.amount,
    });

    if (error) {
      throw error; // catch로 이동
    }

    // 4. 성공 응답
    return NextResponse.json({ data });
  } catch (error) {
    // 5. 에러 로깅 및 응답
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
};
```

### 5.2 에러 로깅

```typescript
// ✅ 올바른 로깅
try {
  // ...
} catch (error) {
  // 서버 콘솔에 상세 에러 출력
  console.error("Detailed error:", error);

  // 클라이언트에는 간단한 메시지만 전달
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

// ❌ 보안 위험 - 상세 에러를 클라이언트에 노출
return NextResponse.json({ error: error.message }, { status: 500 });
```

---

## 6. 보안 및 인증

### 6.1 인증 체크 패턴

**API Routes:**

```typescript
export const GET = async (request: NextRequest) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ 항상 먼저 인증 확인
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 인증된 사용자만 진행
  const { data } = await supabase.from("expenses").select("*").eq("user_id", user.id);

  return NextResponse.json({ data });
};
```

**서버 컴포넌트:**

```typescript
export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Early return
  if (!user) return null; // 또는 redirect("/login")

  // 인증된 사용자만 진행
  const { data } = await supabase.from("expenses").select("*").eq("user_id", user.id);

  return <div>{/* UI */}</div>;
}
```

### 6.2 RLS (Row Level Security)

Supabase는 RLS 정책으로 데이터 접근을 제어합니다.

**중요: 항상 user_id 필터 추가**

```typescript
// ✅ 올바른 예 - 본인 데이터만 조회
const { data } = await supabase.from("expenses").select("*").eq("user_id", user.id);

// ❌ 위험한 예 - 모든 사용자 데이터 조회 시도 (RLS가 막아주긴 하지만 명시적으로 필터링 필요)
const { data } = await supabase.from("expenses").select("*");
```

### 6.3 환경 변수 보안

```typescript
// ✅ 올바른 예 - 서버에서만 사용
export const POST = async (request: NextRequest) => {
  const apiKey = process.env.OPENAI_API_KEY; // 안전
  // ...
};

// ❌ 절대 안 됨 - 클라이언트에 노출
"use client";
export const Component = () => {
  const apiKey = process.env.OPENAI_API_KEY; // undefined (보안상 좋음)
  // 클라이언트에서는 사용 불가
};
```

---

## 7. 성능 최적화

### 7.1 병렬 처리

**독립적인 작업은 병렬로 실행:**

```typescript
// ❌ 순차 실행 (느림)
const supabase = await createClient();
const formData = await request.formData();

// ✅ 병렬 실행 (빠름)
const [supabase, formData] = await Promise.all([createClient(), request.formData()]);
```

**API Route 예시:**

```typescript
export const POST = async (request: NextRequest) => {
  try {
    // ✅ OpenAI 클라이언트 생성은 동기 작업이므로 먼저
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ 독립적인 비동기 작업들을 병렬로 실행
    const [supabase, formData] = await Promise.all([createClient(), request.formData()]);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const image = formData.get("image") as File;

    // ✅ 이미지 변환과 카테고리 조회를 병렬로 실행
    const [imageBuffer, categoriesResult] = await Promise.all([
      image.arrayBuffer(),
      supabase.from("categories").select("name").eq("user_id", user.id),
    ]);

    // ...
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
```

### 7.2 데이터베이스 최적화

**Join을 활용하여 요청 횟수 줄이기:**

```typescript
// ❌ N+1 문제 (느림)
const { data: expenses } = await supabase.from("expenses").select("*");
const expensesWithCategory = await Promise.all(
  expenses.map(async (expense) => {
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("id", expense.category_id)
      .single();
    return { ...expense, category };
  })
);

// ✅ Join 사용 (빠름)
const { data: expenses } = await supabase.from("expenses").select(`
    id,
    name,
    amount,
    category:categories(id, name, icon, color)
  `);
```

**필요한 컬럼만 조회:**

```typescript
// ❌ 모든 컬럼 조회 (무거움)
const { data } = await supabase.from("expenses").select("*");

// ✅ 필요한 컬럼만 조회 (가벼움)
const { data } = await supabase.from("expenses").select("id, name, amount");
```

### 7.3 캐싱 (고급)

**Next.js 15에서 데이터 캐싱:**

```typescript
// 기본값: 캐시됨 (정적 렌더링)
export default async function Page() {
  const { data } = await supabase.from("expenses").select("*");
  return <div>{data?.length}</div>;
}

// 캐시 비활성화 (동적 렌더링)
export const dynamic = "force-dynamic";

export default async function Page() {
  const { data } = await supabase.from("expenses").select("*");
  return <div>{data?.length}</div>;
}

// 재검증 주기 설정 (ISR)
export const revalidate = 60; // 60초마다 재생성

export default async function Page() {
  const { data } = await supabase.from("expenses").select("*");
  return <div>{data?.length}</div>;
}
```

---

## 요약 체크리스트

### API Routes 작성 시

- [ ] 화살표 함수 표현식 사용 (`export const GET = async () => {}`)
- [ ] Try-catch로 에러 처리
- [ ] 인증 확인 (user 체크)
- [ ] 요청 검증 (필수 필드 체크)
- [ ] 적절한 HTTP 상태 코드 반환
- [ ] 타입 정의 (Request/Response)
- [ ] 에러 로그 남기기 (`console.error`)
- [ ] 독립적인 작업은 `Promise.all`로 병렬 처리

### 서버 컴포넌트 작성 시

- [ ] `async function` 사용
- [ ] 서버 클라이언트 import (`lib/supabase/server`)
- [ ] `await createClient()` 호출
- [ ] Early return으로 인증 체크
- [ ] `user_id` 필터링
- [ ] 병렬 페칭 활용 (`Promise.all`)
- [ ] 필요한 컬럼만 select

### Supabase 사용 시

- [ ] 올바른 클라이언트 선택 (server/client)
- [ ] 에러 체크 (`if (error)`)
- [ ] RLS 고려하여 user_id 필터링
- [ ] Join으로 N+1 문제 방지
- [ ] Nullish coalescing (`data ?? []`)

---

## 참고 자료

- [Next.js 공식 문서 - API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js 공식 문서 - Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth Helpers - Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
