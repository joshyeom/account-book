---
title: 정렬 대신 루프로 최소/최대 찾기
impact: LOW
impactDescription: O(n log n) 대신 O(n)
tags: javascript, arrays, performance, sorting, algorithms
---

## 정렬 대신 루프로 최소/최대 찾기

가장 작거나 큰 요소를 찾는 데는 배열을 한 번만 통과하면 됩니다. 정렬은 낭비이고 더 느립니다.

**잘못된 예 (O(n log n) - 최신 항목 찾기 위해 정렬):**

```typescript
interface Project {
  id: string;
  name: string;
  updatedAt: number;
}

function getLatestProject(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  return sorted[0];
}
```

최대값만 찾으려고 전체 배열을 정렬합니다.

**잘못된 예 (O(n log n) - 가장 오래된 것과 최신 것 찾기 위해 정렬):**

```typescript
function getOldestAndNewest(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => a.updatedAt - b.updatedAt);
  return { oldest: sorted[0], newest: sorted[sorted.length - 1] };
}
```

최소/최대만 필요한데 여전히 불필요하게 정렬합니다.

**올바른 예 (O(n) - 단일 루프):**

```typescript
function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return null;

  let latest = projects[0];

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i];
    }
  }

  return latest;
}

function getOldestAndNewest(projects: Project[]) {
  if (projects.length === 0) return { oldest: null, newest: null };

  let oldest = projects[0];
  let newest = projects[0];

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt < oldest.updatedAt) oldest = projects[i];
    if (projects[i].updatedAt > newest.updatedAt) newest = projects[i];
  }

  return { oldest, newest };
}
```

배열을 한 번만 통과, 복사 없음, 정렬 없음.

**대안 (작은 배열에서 Math.min/Math.max):**

```typescript
const numbers = [5, 2, 8, 1, 9];
const min = Math.min(...numbers);
const max = Math.max(...numbers);
```

작은 배열에서는 작동하지만 spread 연산자 제한으로 인해 매우 큰 배열에서는 더 느릴 수 있습니다. 신뢰성을 위해 루프 접근 방식을 사용하세요.
