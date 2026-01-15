---
title: 함수에서 조기 반환
impact: LOW-MEDIUM
impactDescription: 불필요한 연산 방지
tags: javascript, functions, optimization, early-return
---

## 함수에서 조기 반환

결과가 결정되면 불필요한 처리를 건너뛰기 위해 조기 반환합니다.

**잘못된 예 (답을 찾은 후에도 모든 항목 처리):**

```typescript
function validateUsers(users: User[]) {
  let hasError = false;
  let errorMessage = "";

  for (const user of users) {
    if (!user.email) {
      hasError = true;
      errorMessage = "이메일이 필요합니다";
    }
    if (!user.name) {
      hasError = true;
      errorMessage = "이름이 필요합니다";
    }
    // 에러를 찾은 후에도 모든 사용자를 계속 검사
  }

  return hasError ? { valid: false, error: errorMessage } : { valid: true };
}
```

**올바른 예 (첫 번째 에러에서 즉시 반환):**

```typescript
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) {
      return { valid: false, error: "이메일이 필요합니다" };
    }
    if (!user.name) {
      return { valid: false, error: "이름이 필요합니다" };
    }
  }

  return { valid: true };
}
```
