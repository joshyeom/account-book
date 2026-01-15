---
title: 반복 조회를 위한 인덱스 맵 구축
impact: LOW-MEDIUM
impactDescription: 100만 연산 → 2천 연산
tags: javascript, map, indexing, optimization, performance
---

## 반복 조회를 위한 인덱스 맵 구축

동일한 키로 여러 번 `.find()`를 호출하면 Map을 사용해야 합니다.

**잘못된 예 (조회당 O(n)):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  return orders.map((order) => ({
    ...order,
    user: users.find((u) => u.id === order.userId),
  }));
}
```

**올바른 예 (조회당 O(1)):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map((u) => [u.id, u]));

  return orders.map((order) => ({
    ...order,
    user: userById.get(order.userId),
  }));
}
```

맵을 한 번 구축(O(n))하면 모든 조회가 O(1)입니다.
1000개 주문 × 1000명 사용자의 경우: 100만 연산 → 2천 연산.
