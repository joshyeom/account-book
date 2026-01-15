---
title: 함수형 setState 업데이트 사용
impact: MEDIUM
impactDescription: 스테일 클로저 방지 및 불필요한 콜백 재생성 방지
tags: react, hooks, useState, useCallback, callbacks, closures
---

## 함수형 setState 업데이트 사용

현재 상태 값을 기반으로 상태를 업데이트할 때, 상태 변수를 직접 참조하는 대신 setState의 함수형 업데이트를 사용합니다. 이는 스테일 클로저를 방지하고 불필요한 의존성을 제거하며 안정적인 콜백 참조를 생성합니다.

**잘못된 예 (의존성으로 state 필요):**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems);

  // 콜백이 items에 의존해야 하므로 items가 변경될 때마다 재생성
  const addItems = useCallback(
    (newItems: Item[]) => {
      setItems([...items, ...newItems]);
    },
    [items]
  ); // ❌ items 의존성으로 재생성 발생

  // 의존성을 빠뜨리면 스테일 클로저 위험
  const removeItem = useCallback((id: string) => {
    setItems(items.filter((item) => item.id !== id));
  }, []); // ❌ items 의존성 누락 - 스테일 items 사용!

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />;
}
```

첫 번째 콜백은 `items`가 변경될 때마다 재생성되어 자식 컴포넌트의 불필요한 리렌더를 유발할 수 있습니다. 두 번째 콜백에는 스테일 클로저 버그가 있어 항상 초기 `items` 값을 참조합니다.

**올바른 예 (안정적인 콜백, 스테일 클로저 없음):**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems);

  // 안정적인 콜백, 재생성 없음
  const addItems = useCallback((newItems: Item[]) => {
    setItems((curr) => [...curr, ...newItems]);
  }, []); // ✅ 의존성 불필요

  // 항상 최신 상태 사용, 스테일 클로저 위험 없음
  const removeItem = useCallback((id: string) => {
    setItems((curr) => curr.filter((item) => item.id !== id));
  }, []); // ✅ 안전하고 안정적

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />;
}
```

**장점:**

1. **안정적인 콜백 참조** - 상태가 변경되어도 콜백이 재생성되지 않음
2. **스테일 클로저 없음** - 항상 최신 상태 값으로 작동
3. **의존성 감소** - 의존성 배열이 단순해지고 메모리 누수 감소
4. **버그 방지** - 가장 흔한 React 클로저 버그 원인 제거

**함수형 업데이트를 사용해야 할 때:**

- 현재 상태 값에 의존하는 모든 setState
- state가 필요한 useCallback/useMemo 내부
- state를 참조하는 이벤트 핸들러
- state를 업데이트하는 비동기 작업

**직접 업데이트가 괜찮은 경우:**

- 정적 값으로 설정: `setCount(0)`
- props/인자에서만 설정: `setName(newName)`
- 이전 값에 의존하지 않는 상태

**참고:** 프로젝트에 [React Compiler](https://react.dev/learn/react-compiler)가 활성화되어 있다면 컴파일러가 일부 경우를 자동으로 최적화할 수 있지만, 정확성과 스테일 클로저 버그 방지를 위해 함수형 업데이트가 여전히 권장됩니다.
