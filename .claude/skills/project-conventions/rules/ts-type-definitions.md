---
title: TypeScript 타입 정의 규칙
category: typescript
---

## TypeScript 타입 정의 규칙

### type 우선 사용

객체 타입 정의 시 `type`을 우선 사용합니다.

**올바른 예:**

```typescript
type User = {
  id: string;
  name: string;
  email: string;
};

type ButtonProps = {
  variant: "primary" | "secondary";
  onClick: () => void;
};

type Status = "idle" | "loading" | "success" | "error";
```

**잘못된 예:**

```typescript
interface User {
  id: string;
  name: string;
}
```

### Props 정의 위치

Props 타입은 파일 상단, import 다음에 정의합니다.

```typescript
"use client";

import { useState } from "react";

// Props 타입 정의 (파일 상단)
type UserCardProps = {
  name: string;
  email: string;
};

export const UserCard = ({ name, email }: UserCardProps) => {
  return <div>{name}</div>;
};
```

### API 응답 타입 변환

DB/API의 snake_case는 앱 내부에서 camelCase로 변환합니다.

```typescript
// API 응답
type ApiResponse = {
  user_id: string;
  created_at: string;
};

// 앱 내부
type User = {
  userId: string;
  createdAt: string;
};
```
