---
title: 표시/숨김에 Activity 컴포넌트 사용
impact: MEDIUM
impactDescription: 상태/DOM 보존
tags: rendering, activity, visibility, state-preservation
---

## 표시/숨김에 Activity 컴포넌트 사용

자주 가시성을 토글하는 비용이 많이 드는 컴포넌트의 상태/DOM을 보존하기 위해 React의 `<Activity>`를 사용합니다.

**사용법:**

```tsx
import { Activity } from "react";

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? "visible" : "hidden"}>
      <ExpensiveMenu />
    </Activity>
  );
}
```

비용이 많이 드는 리렌더와 상태 손실을 방지합니다.
