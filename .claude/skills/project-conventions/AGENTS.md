# 프로젝트 코딩 컨벤션 (전체 가이드)

이 문서는 AI 가계부 프로젝트의 모든 코딩 컨벤션을 정의합니다.

---

## 1. 기본 포맷팅

### 1.1 들여쓰기 및 공백

| 항목      | 설정             |
| --------- | ---------------- |
| 들여쓰기  | Space 2칸        |
| 따옴표    | Double Quote `"` |
| 세미콜론  | 사용함 `;`       |
| 라인 길이 | 최대 100자       |
| 후행 쉼표 | ES5 호환 (`es5`) |

### 1.2 Import 정렬 순서

import는 자동으로 다음 순서로 정렬됩니다:

1. React 관련
2. Next.js 관련
3. 서드파티 라이브러리
4. `@/lib/*` 내부 유틸리티
5. `@/components/*` 컴포넌트 (barrel import)
6. `@/hooks/*` 커스텀 훅
7. `@/types/*` 타입
8. 상대 경로 (같은 폴더 내)

```typescript
import { useState } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { ExpenseList, SummaryCards } from "@/components/expense";
import { Button, Card, Input } from "@/components/ui";

import { useAuth } from "@/hooks/use-auth";

import type { User } from "@/types/database";

import { ReceiptUpload } from "./ReceiptUpload";
```

### 1.3 Barrel Import 사용

컴포넌트는 반드시 barrel export를 통해 import 합니다.

**올바른 예:**

```typescript
// UI 컴포넌트 - barrel import
// Feature 컴포넌트 - barrel import
import { ExpenseList, SummaryCards } from "@/components/expense";
import { BottomNav, Header } from "@/components/layout";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";
```

**잘못된 예:**

```typescript
// 개별 파일에서 직접 import 금지
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

---

## 2. TypeScript 규칙

### 2.1 타입 정의 - type 우선

객체 타입 정의 시 `type`을 우선 사용합니다. `interface`는 확장이 필요한 경우에만 사용합니다.

**올바른 예:**

```typescript
// type 사용 (권장)
type User = {
  id: string;
  name: string;
  email: string;
};

type ButtonProps = {
  variant: "primary" | "secondary";
  onClick: () => void;
};

// 유니온 타입
type Status = "idle" | "loading" | "success" | "error";

// 유틸리티 타입
type UserPartial = Partial<User>;
```

**잘못된 예:**

```typescript
// interface 사용 지양
interface User {
  id: string;
  name: string;
}
```

### 2.2 Props 정의 위치

Props 타입은 파일 상단, import 다음에 정의합니다.

```typescript
"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

// Props 타입 정의 (파일 상단)
type UserCardProps = {
  name: string;
  email: string;
  onEdit: () => void;
};

// 컴포넌트
export const UserCard = ({ name, email, onEdit }: UserCardProps) => {
  // ...
};
```

### 2.3 API 응답 타입 - camelCase 변환

DB/API 응답의 snake_case는 camelCase로 변환하여 사용합니다.

```typescript
// API 응답 (snake_case)
type ApiResponse = {
  user_id: string;
  created_at: string;
};

// 앱 내부 사용 (camelCase)
type User = {
  userId: string;
  createdAt: string;
};

// 변환 함수 사용
const transformUser = (api: ApiResponse): User => ({
  userId: api.user_id,
  createdAt: api.created_at,
});
```

---

## 3. 함수 규칙

### 3.1 화살표 함수 표현식 사용

모든 함수는 화살표 함수 표현식으로 작성합니다.

**올바른 예:**

```typescript
// 일반 함수
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// 컴포넌트
export const UserCard = ({ name }: UserCardProps) => {
  return <div>{name}</div>;
};

// 이벤트 핸들러
const handleClick = () => {
  console.log("clicked");
};

// 비동기 함수
const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

**잘못된 예:**

```typescript
// function 선언문 지양
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function UserCard({ name }: UserCardProps) {
  return <div>{name}</div>;
}
```

### 3.2 Early Return 패턴

조건 불만족 시 즉시 반환하여 중첩을 줄입니다.

**올바른 예:**

```typescript
const processUser = (user: User | null) => {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;

  // 메인 로직
  return {
    ...user,
    processedAt: new Date(),
  };
};
```

**잘못된 예:**

```typescript
const processUser = (user: User | null) => {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return {
          ...user,
          processedAt: new Date(),
        };
      }
    }
  }
  return null;
};
```

### 3.3 이벤트 핸들러 네이밍

`handle` + 동사 형식을 사용합니다.

```typescript
const handleClick = () => {};
const handleSubmit = () => {};
const handleInputChange = () => {};
const handleUserDelete = () => {};
```

### 3.4 비동기 함수 네이밍

동사로 시작합니다.

```typescript
const fetchUser = async (id: string) => {};
const loadCategories = async () => {};
const createExpense = async (data: ExpenseInput) => {};
const updateProfile = async (userId: string, data: ProfileData) => {};
const deleteTransaction = async (id: string) => {};
```

---

## 4. React 규칙

### 4.1 Named Export 사용

컴포넌트는 Named Export를 사용합니다. (Next.js 페이지 제외)

**올바른 예:**

```typescript
// 컴포넌트
export const UserCard = () => {};
export const ExpenseList = () => {};

// 훅
export const useAuth = () => {};
```

**예외 - Next.js 페이지:**

```typescript
// app/page.tsx - default export 필요
export default function HomePage() {
  return <div>Home</div>;
}
```

### 4.2 상태 변수 네이밍

불리언 상태는 `is`, `has`, `can`, `should` 접두사를 사용합니다.

```typescript
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [canSubmit, setCanSubmit] = useState(true);
const [shouldRefetch, setShouldRefetch] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 4.3 상태 관리 방식

| 용도               | 도구        |
| ------------------ | ----------- |
| 서버 상태          | React Query |
| 지역 UI 상태       | useState    |
| 전역 상태          | Zustand     |
| 컴포넌트 트리 공유 | Context API |

```typescript
// 서버 상태 - React Query
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});

// 지역 상태 - useState
const [isOpen, setIsOpen] = useState(false);

// 전역 상태 - Zustand
const { theme } = useThemeStore();

// 컴포넌트 트리 공유 - Context
const { user } = useAuthContext();
```

### 4.4 에러 처리 - Error Boundary

UI 에러는 Error Boundary로 처리합니다.

```typescript
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

### 4.5 cn() 유틸리티 사용

조건부 클래스가 있을 때만 `cn()` 사용합니다.

**올바른 예:**

```typescript
// 조건부 클래스 있음 - cn() 사용
<button className={cn("px-4 py-2", isActive && "bg-blue-500")}>

// 조건부 클래스 없음 - 직접 문자열
<button className="px-4 py-2 bg-blue-500">
```

**잘못된 예:**

```typescript
// 불필요한 cn() 사용
<button className={cn("px-4 py-2 bg-blue-500")}>
```

---

## 5. 파일/폴더 규칙

### 5.1 파일 네이밍 - kebab-case

```
src/
├── components/
│   ├── user-card/
│   │   ├── index.tsx
│   │   └── types.ts
│   ├── expense-list/
│   │   ├── index.tsx
│   │   └── types.ts
│   └── ui/
│       ├── button.tsx
│       └── input.tsx
├── hooks/
│   ├── use-auth.ts
│   └── use-expenses.ts
└── lib/
    ├── utils.ts
    └── constants.ts
```

### 5.2 컴포넌트 폴더 구조

복잡한 컴포넌트는 폴더로 구성합니다.

```
user-card/
├── index.tsx      # 메인 컴포넌트 + export
├── types.ts       # 타입 정의
├── hooks.ts       # 컴포넌트 전용 훅 (필요시)
└── utils.ts       # 컴포넌트 전용 유틸 (필요시)
```

### 5.3 Import 경로 - 절대 경로 (@/)

```typescript
// 올바른 예 - 절대 경로
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// 잘못된 예 - 상대 경로
import { Button } from "../../components/ui/button";
```

---

## 6. Git 컨벤션

### 6.1 커밋 메시지 형식

Conventional Commits + 한글 사용

```
<type>: <제목>

[본문 (선택)]

[푸터 (선택)]
```

### 6.2 커밋 타입

| 타입       | 설명        | 예시                                             |
| ---------- | ----------- | ------------------------------------------------ |
| `feat`     | 새로운 기능 | `feat: 영수증 OCR 분석 기능 추가`                |
| `fix`      | 버그 수정   | `fix: 로그인 실패 시 에러 메시지 표시 오류 수정` |
| `docs`     | 문서 수정   | `docs: README에 설치 방법 추가`                  |
| `style`    | 코드 포맷팅 | `style: Prettier 적용`                           |
| `refactor` | 리팩토링    | `refactor: 사용자 인증 로직 개선`                |
| `perf`     | 성능 개선   | `perf: 이미지 로딩 최적화`                       |
| `test`     | 테스트      | `test: 로그인 기능 단위 테스트 추가`             |
| `chore`    | 빌드/설정   | `chore: ESLint 규칙 업데이트`                    |
| `ci`       | CI 설정     | `ci: GitHub Actions 워크플로우 추가`             |

### 6.3 커밋 메시지 예시

```bash
# 새 기능
feat: 월별 지출 통계 차트 추가

- Recharts 라이브러리 사용
- 카테고리별 파이 차트 구현
- 일별 추이 라인 차트 구현

# 버그 수정
fix: 날짜 선택 시 시간대 오류 수정

UTC와 KST 변환 로직 추가

Closes #123

# 리팩토링
refactor: 지출 목록 컴포넌트 분리

- ExpenseItem 컴포넌트 추출
- 공통 스타일 정리
```

---

## 7. 코드 스타일 세부 규칙

### 7.1 Optional Chaining 적극 사용

```typescript
// 올바른 예
const userName = user?.profile?.name;
const firstItem = items?.[0];

// 잘못된 예
const userName = user && user.profile && user.profile.name;
```

### 7.2 Nullish Coalescing 사용

```typescript
// 올바른 예 - ?? 사용 (0, "" 유효값 처리)
const count = value ?? 0;
const name = user.name ?? "Unknown";

// 주의 - || 사용 시 0, "" 도 false로 처리됨
const count = value || 0; // value가 0이면 0 대신 0 반환... 같음
```

### 7.3 배열 메서드 체이닝

```typescript
// 올바른 예
const result = items
  .filter((item) => item.isActive)
  .map((item) => item.name)
  .join(", ");

// 복잡한 경우 reduce 사용
const result = items.reduce((acc, item) => {
  if (item.isActive) {
    acc.names.push(item.name);
    acc.total += item.price;
  }
  return acc;
}, { names: [], total: 0 });
```

### 7.4 매직 넘버 상수화

```typescript
// 올바른 예
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEBOUNCE_DELAY = 300;
const MAX_RETRY_COUNT = 3;

if (file.size > MAX_FILE_SIZE) {
  throw new Error("파일 크기 초과");
}

// 잘못된 예
if (file.size > 5242880) {
  throw new Error("파일 크기 초과");
}
```

### 7.5 주석 작성 - 최소한으로

Why 위주로 필요할 때만 작성합니다.

```typescript
// 올바른 예 - Why 설명
// Supabase RLS 정책으로 인해 user_id 필터 필수
const { data } = await supabase
  .from("expenses")
  .select("*")
  .eq("user_id", userId);

// 잘못된 예 - What 설명 (불필요)
// 사용자 ID로 지출 목록 조회
const { data } = await supabase
  .from("expenses")
  .select("*")
  .eq("user_id", userId);
```

---

## 8. CSS/스타일링 규칙

### 8.1 Tailwind 우선

```typescript
// 올바른 예 - Tailwind 클래스
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  저장
</button>

// 복잡한 조건부 스타일
<button
  className={cn(
    "px-4 py-2 rounded-lg transition-colors",
    isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
  )}
>
  {label}
</button>
```

### 8.2 Tailwind 클래스 자동 정렬

`prettier-plugin-tailwindcss`가 자동으로 클래스를 정렬합니다.

정렬 순서:

1. 레이아웃 (flex, grid, position)
2. 박스 모델 (width, height, padding, margin)
3. 타이포그래피 (font, text)
4. 배경/테두리 (bg, border)
5. 효과 (shadow, opacity)
6. 상태 (hover, focus)

---

## 9. NPM 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run format:check # Prettier 검사
npm run typecheck    # TypeScript 타입 검사
npm run check-all    # 전체 검사 (타입 + 린트 + 포맷)
```

---

## 10. 자동화

### 10.1 저장 시 자동 실행 (VSCode)

- ESLint 자동 수정
- Prettier 포맷팅
- Tailwind 클래스 정렬
- Import 자동 정렬

### 10.2 커밋 시 자동 실행 (husky + lint-staged)

- `.ts`, `.tsx` 파일: ESLint 수정 + Prettier 포맷팅
- `.json`, `.md`, `.css` 파일: Prettier 포맷팅
- 커밋 메시지: commitlint 검사
