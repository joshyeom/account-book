---
title: 불변성을 위해 sort() 대신 toSorted() 사용
impact: MEDIUM-HIGH
impactDescription: React 상태의 변형 버그 방지
tags: javascript, arrays, immutability, react, state, mutation
---

## 불변성을 위해 sort() 대신 toSorted() 사용

`.sort()`는 배열을 제자리에서 변형하여 React 상태와 props에서 버그를 유발할 수 있습니다. 변형 없이 새로 정렬된 배열을 생성하려면 `.toSorted()`를 사용하세요.

**잘못된 예 (원본 배열 변형):**

```typescript
function UserList({ users }: { users: User[] }) {
  // users prop 배열을 변형!
  const sorted = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**올바른 예 (새 배열 생성):**

```typescript
function UserList({ users }: { users: User[] }) {
  // 새로 정렬된 배열 생성, 원본은 변경 없음
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**React에서 이것이 중요한 이유:**

1. Props/상태 변형은 React의 불변성 모델을 깨뜨림 - React는 props와 상태가 읽기 전용으로 취급되기를 기대
2. 스테일 클로저 버그 유발 - 클로저(콜백, 이펙트) 내에서 배열을 변형하면 예상치 못한 동작 발생

**브라우저 지원 (구형 브라우저 폴백):**

`.toSorted()`는 모든 최신 브라우저에서 사용 가능 (Chrome 110+, Safari 16+, Firefox 115+, Node.js 20+). 구형 환경에서는 spread 연산자 사용:

```typescript
// 구형 브라우저 폴백
const sorted = [...items].sort((a, b) => a.value - b.value);
```

**다른 불변 배열 메서드:**

- `.toSorted()` - 불변 정렬
- `.toReversed()` - 불변 역순
- `.toSpliced()` - 불변 splice
- `.with()` - 불변 요소 교체
