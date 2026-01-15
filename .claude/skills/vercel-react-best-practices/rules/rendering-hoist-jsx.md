---
title: 정적 JSX 요소 호이스팅
impact: LOW
impactDescription: 재생성 방지
tags: rendering, jsx, static, optimization
---

## 정적 JSX 요소 호이스팅

재생성을 피하기 위해 정적 JSX를 컴포넌트 외부로 추출합니다.

**잘못된 예 (매 렌더마다 요소 재생성):**

```tsx
function LoadingSkeleton() {
  return <div className="h-20 animate-pulse bg-gray-200" />;
}

function Container() {
  return <div>{loading && <LoadingSkeleton />}</div>;
}
```

**올바른 예 (동일한 요소 재사용):**

```tsx
const loadingSkeleton = <div className="h-20 animate-pulse bg-gray-200" />;

function Container() {
  return <div>{loading && loadingSkeleton}</div>;
}
```

이는 특히 크고 정적인 SVG 노드에 유용합니다. 매 렌더마다 재생성하면 비용이 많이 들 수 있습니다.

**참고:** 프로젝트에 [React Compiler](https://react.dev/learn/react-compiler)가 활성화되어 있다면 컴파일러가 자동으로 정적 JSX 요소를 호이스팅하고 컴포넌트 리렌더를 최적화하므로 수동 호이스팅이 필요하지 않습니다.
