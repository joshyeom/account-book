---
title: 여러 배열 순회 결합
impact: LOW-MEDIUM
impactDescription: 순회 횟수 감소
tags: javascript, arrays, loops, performance
---

## 여러 배열 순회 결합

여러 `.filter()`나 `.map()` 호출은 배열을 여러 번 순회합니다. 하나의 루프로 결합하세요.

**잘못된 예 (3번 순회):**

```typescript
const admins = users.filter((u) => u.isAdmin);
const testers = users.filter((u) => u.isTester);
const inactive = users.filter((u) => !u.isActive);
```

**올바른 예 (1번 순회):**

```typescript
const admins: User[] = [];
const testers: User[] = [];
const inactive: User[] = [];

for (const user of users) {
  if (user.isAdmin) admins.push(user);
  if (user.isTester) testers.push(user);
  if (!user.isActive) inactive.push(user);
}
```
