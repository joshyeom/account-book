---
title: React 컴포넌트 규칙
category: react
---

## React 컴포넌트 규칙

### Named Export 사용

컴포넌트는 Named Export를 사용합니다. (Next.js 페이지 제외)

**올바른 예:**

```typescript
export const UserCard = ({ name }: UserCardProps) => {
  return <div>{name}</div>;
};

export const ExpenseList = ({ items }: ExpenseListProps) => {
  return <ul>{/* ... */}</ul>;
};
```

**예외 - Next.js 페이지:**

```typescript
// app/page.tsx
export default function HomePage() {
  return <div>Home</div>;
}
```

### 상태 변수 네이밍

불리언 상태는 `is`, `has`, `can`, `should` 접두사 사용

```typescript
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [canSubmit, setCanSubmit] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 상태 관리 방식

| 용도               | 도구        |
| ------------------ | ----------- |
| 서버 상태          | React Query |
| 지역 UI 상태       | useState    |
| 전역 상태          | Zustand     |
| 컴포넌트 트리 공유 | Context API |

### 에러 처리 - Error Boundary

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

### cn() 유틸리티

조건부 클래스가 있을 때만 사용

**올바른 예:**

```typescript
// 조건부 있음 - cn() 사용
<button className={cn("px-4 py-2", isActive && "bg-blue-500")}>

// 조건부 없음 - 직접 문자열
<button className="px-4 py-2 bg-blue-500">
```
