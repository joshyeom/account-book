---
title: React.cache()로 요청 단위 중복 제거
impact: MEDIUM
impactDescription: 요청 내 중복 제거
tags: server, cache, react-cache, deduplication
---

## React.cache()로 요청 단위 중복 제거

서버 측 요청 중복 제거를 위해 `React.cache()`를 사용합니다. 인증과 데이터베이스 쿼리가 가장 큰 이점을 얻습니다.

**사용법:**

```typescript
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return await db.user.findUnique({
    where: { id: session.user.id },
  });
});
```

단일 요청 내에서 `getCurrentUser()`를 여러 번 호출해도 쿼리는 한 번만 실행됩니다.
