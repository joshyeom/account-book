---
title: 기본 포맷팅 규칙
category: format
---

## 기본 포맷팅 규칙

### 설정 값

| 항목      | 설정             |
| --------- | ---------------- |
| 들여쓰기  | Space 2칸        |
| 따옴표    | Double Quote `"` |
| 세미콜론  | 사용함 `;`       |
| 라인 길이 | 최대 100자       |
| 후행 쉼표 | ES5 호환 (`es5`) |

### Import 정렬 순서

1. React 관련
2. Next.js 관련
3. 서드파티 라이브러리
4. `@/lib/*` 내부 유틸리티
5. `@/components/*` 컴포넌트
6. `@/hooks/*` 커스텀 훅
7. `@/types/*` 타입
8. 기타 내부 모듈
9. 상대 경로

**올바른 예:**

```typescript
import { useState } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";

import type { User } from "@/types/database";
```
