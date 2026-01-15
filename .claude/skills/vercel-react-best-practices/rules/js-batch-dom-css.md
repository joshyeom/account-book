---
title: DOM CSS 변경 일괄 처리
impact: MEDIUM
impactDescription: reflow/repaint 감소
tags: javascript, dom, css, performance, reflow
---

## DOM CSS 변경 일괄 처리

스타일을 한 번에 하나의 속성씩 변경하는 것을 피하세요. 여러 CSS 변경을 클래스나 `cssText`를 통해 그룹화하여 브라우저 reflow를 최소화합니다.

**잘못된 예 (여러 번의 reflow):**

```typescript
function updateElementStyles(element: HTMLElement) {
  // 각 줄이 reflow를 트리거
  element.style.width = "100px";
  element.style.height = "200px";
  element.style.backgroundColor = "blue";
  element.style.border = "1px solid black";
}
```

**올바른 예 (클래스 추가 - 단일 reflow):**

```typescript
// CSS 파일
.highlighted-box {
  width: 100px;
  height: 200px;
  background-color: blue;
  border: 1px solid black;
}

// JavaScript
function updateElementStyles(element: HTMLElement) {
  element.classList.add('highlighted-box')
}
```

**올바른 예 (cssText 변경 - 단일 reflow):**

```typescript
function updateElementStyles(element: HTMLElement) {
  element.style.cssText = `
    width: 100px;
    height: 200px;
    background-color: blue;
    border: 1px solid black;
  `;
}
```

**React 예시:**

```tsx
// 잘못된 예: 스타일을 하나씩 변경
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = "100px";
      ref.current.style.height = "200px";
      ref.current.style.backgroundColor = "blue";
    }
  }, [isHighlighted]);

  return <div ref={ref}>콘텐츠</div>;
}

// 올바른 예: 클래스 토글
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  return <div className={isHighlighted ? "highlighted-box" : ""}>콘텐츠</div>;
}
```

가능하면 인라인 스타일보다 CSS 클래스를 선호하세요. 클래스는 브라우저에 의해 캐시되고 관심사 분리를 더 잘 제공합니다.
