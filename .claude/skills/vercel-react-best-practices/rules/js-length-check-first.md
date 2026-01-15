---
title: 배열 비교 시 길이 먼저 확인
impact: MEDIUM-HIGH
impactDescription: 길이가 다를 때 비용 많은 연산 방지
tags: javascript, arrays, performance, optimization, comparison
---

## 배열 비교 시 길이 먼저 확인

비용이 많이 드는 연산(정렬, 깊은 동등성, 직렬화)으로 배열을 비교할 때 먼저 길이를 확인하세요. 길이가 다르면 배열은 같을 수 없습니다.

실제 애플리케이션에서 이 최적화는 비교가 핫 패스(이벤트 핸들러, 렌더 루프)에서 실행될 때 특히 유용합니다.

**잘못된 예 (항상 비용 많은 비교 실행):**

```typescript
function hasChanges(current: string[], original: string[]) {
  // 길이가 다르더라도 항상 정렬하고 조인
  return current.sort().join() !== original.sort().join();
}
```

`current.length`가 5이고 `original.length`가 100일 때도 두 번의 O(n log n) 정렬이 실행됩니다. 배열을 조인하고 문자열을 비교하는 오버헤드도 있습니다.

**올바른 예 (O(1) 길이 체크 먼저):**

```typescript
function hasChanges(current: string[], original: string[]) {
  // 길이가 다르면 조기 반환
  if (current.length !== original.length) {
    return true;
  }
  // 길이가 같을 때만 정렬/조인
  const currentSorted = current.toSorted();
  const originalSorted = original.toSorted();
  for (let i = 0; i < currentSorted.length; i++) {
    if (currentSorted[i] !== originalSorted[i]) {
      return true;
    }
  }
  return false;
}
```

이 새로운 접근 방식이 더 효율적인 이유:

- 길이가 다를 때 정렬 및 조인 오버헤드 방지
- 조인된 문자열을 위한 메모리 소비 방지 (특히 큰 배열에서 중요)
- 원본 배열을 변형하지 않음
- 차이점을 찾으면 조기 반환
