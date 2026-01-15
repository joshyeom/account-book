---
title: 파일/폴더 구조 규칙
category: file
---

## 파일/폴더 구조 규칙

### 파일 네이밍 - kebab-case

```
src/
├── components/
│   ├── expense/
│   │   ├── index.ts        # barrel export
│   │   ├── AddExpenseForm.tsx
│   │   └── ExpenseList.tsx
│   └── ui/
│       ├── index.ts        # barrel export
│       ├── button.tsx
│       └── input.tsx
├── hooks/
│   ├── use-auth.ts
│   └── use-expenses.ts
└── lib/
    ├── utils.ts
    └── constants.ts
```

### Barrel Export 구조

각 컴포넌트 폴더에 `index.ts` 파일을 생성하여 barrel export를 구성합니다.

```typescript
// components/expense/index.ts
export * from "./AddExpenseForm";
export * from "./ExpenseChart";
export * from "./ExpenseItem";
export * from "./ExpenseList";
```

```typescript
// components/ui/index.ts
export * from "./button";
export * from "./card";
export * from "./input";
// ... 모든 UI 컴포넌트
```

### Import 규칙 - Barrel Import 사용

**올바른 예:**

```typescript
// UI 컴포넌트 - barrel import
import { createClient } from "@/lib/supabase/client";
// 라이브러리
import { cn } from "@/lib/utils";

// Feature 컴포넌트 - barrel import
import { ExpenseList, SummaryCards } from "@/components/expense";
import { BottomNav, Header } from "@/components/layout";
import { SettingsClient } from "@/components/settings";
import { Button, Card, CardContent, Input } from "@/components/ui";
```

**잘못된 예:**

```typescript
// 개별 파일에서 직접 import 금지
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 상대 경로 금지
import { Button } from "../../components/ui/button";
```

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지 그룹
│   ├── (main)/            # 메인 페이지 그룹
│   ├── api/               # API Routes
│   └── layout.tsx         # 루트 레이아웃
├── components/
│   ├── index.ts           # 전체 barrel export
│   ├── ui/                # shadcn/ui 기본 컴포넌트
│   │   └── index.ts       # UI barrel export
│   ├── expense/           # 지출 관련 컴포넌트
│   │   └── index.ts       # expense barrel export
│   ├── layout/            # 레이아웃 컴포넌트
│   │   └── index.ts       # layout barrel export
│   ├── settings/
│   │   └── index.ts
│   ├── statistics/
│   │   └── index.ts
│   └── transactions/
│       └── index.ts
├── hooks/                 # 커스텀 훅
├── lib/                   # 유틸리티 및 설정
│   └── supabase/          # Supabase 클라이언트
└── types/                 # TypeScript 타입 정의
```

### Barrel 파일 자동 생성

`npm run barrels` 명령으로 barrel 파일을 자동 생성할 수 있습니다.

```bash
npm run barrels
```

스크립트는 `scripts/generate-barrels.js`에 위치하며 다음 디렉토리의 index.ts를 생성합니다:

- src/components/ui
- src/components/expense
- src/components/layout
- src/components/settings
- src/components/statistics
- src/components/transactions

새 컴포넌트 폴더 추가 시 스크립트의 `DIRECTORIES` 배열에 추가해야 합니다.

### Import 정렬 순서

Prettier가 자동으로 다음 순서로 정렬합니다:

1. React 관련
2. Next.js 관련
3. 서드파티 라이브러리
4. `@/lib/*` 내부 유틸리티
5. `@/components/*` 컴포넌트 (barrel import)
6. `@/hooks/*` 커스텀 훅
7. `@/types/*` 타입
8. 상대 경로 (같은 폴더 내)
