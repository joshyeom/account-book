---
title: Effect 의존성 범위 좁히기
impact: LOW
impactDescription: effect 재실행 최소화
tags: rerender, useEffect, dependencies, optimization
---

## Effect 의존성 범위 좁히기

effect 재실행을 최소화하기 위해 객체 대신 원시값 의존성을 지정합니다.

**잘못된 예 (user의 모든 필드 변경 시 재실행):**

```tsx
useEffect(() => {
  console.log(user.id);
}, [user]);
```

**올바른 예 (id 변경 시에만 재실행):**

```tsx
useEffect(() => {
  console.log(user.id);
}, [user.id]);
```

**파생 상태의 경우, effect 외부에서 계산:**

```tsx
// 잘못된 예: width=767, 766, 765...마다 실행
useEffect(() => {
  if (width < 768) {
    enableMobileMode();
  }
}, [width]);

// 올바른 예: boolean 전환 시에만 실행
const isMobile = width < 768;
useEffect(() => {
  if (isMobile) {
    enableMobileMode();
  }
}, [isMobile]);
```
