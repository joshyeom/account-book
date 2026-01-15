---
title: 함수 선언 규칙
category: function
---

## 함수 선언 규칙

### 화살표 함수 표현식 사용

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
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function UserCard({ name }: UserCardProps) {
  return <div>{name}</div>;
}
```

### Early Return 패턴

조건 불만족 시 즉시 반환하여 중첩을 줄입니다.

**올바른 예:**

```typescript
const processUser = (user: User | null) => {
  if (!user) return null;
  if (!user.isActive) return null;

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
      return {
        ...user,
        processedAt: new Date(),
      };
    }
  }
  return null;
};
```

### 네이밍 컨벤션

**이벤트 핸들러:** `handle` + 동사

```typescript
const handleClick = () => {};
const handleSubmit = () => {};
const handleInputChange = () => {};
```

**비동기 함수:** 동사로 시작

```typescript
const fetchUser = async (id: string) => {};
const loadCategories = async () => {};
const createExpense = async (data: ExpenseInput) => {};
```
