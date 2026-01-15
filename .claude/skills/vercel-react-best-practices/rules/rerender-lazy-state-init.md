---
title: 지연 상태 초기화 사용
impact: MEDIUM
impactDescription: 매 렌더마다 낭비되는 연산
tags: react, hooks, useState, performance, initialization
---

## 지연 상태 초기화 사용

비용이 많이 드는 초기값에는 `useState`에 함수를 전달합니다. 함수 형태가 없으면 초기화 코드가 값이 한 번만 사용되더라도 매 렌더마다 실행됩니다.

**잘못된 예 (매 렌더마다 실행):**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()가 초기화 후에도 매 렌더마다 실행됨
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items));
  const [query, setQuery] = useState("");

  // query가 변경되면 buildSearchIndex가 불필요하게 다시 실행
  return <SearchResults index={searchIndex} query={query} />;
}

function UserProfile() {
  // JSON.parse가 매 렌더마다 실행
  const [settings, setSettings] = useState(JSON.parse(localStorage.getItem("settings") || "{}"));

  return <SettingsForm settings={settings} onChange={setSettings} />;
}
```

**올바른 예 (한 번만 실행):**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()가 초기 렌더에서만 실행
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items));
  const [query, setQuery] = useState("");

  return <SearchResults index={searchIndex} query={query} />;
}

function UserProfile() {
  // JSON.parse가 초기 렌더에서만 실행
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("settings");
    return stored ? JSON.parse(stored) : {};
  });

  return <SettingsForm settings={settings} onChange={setSettings} />;
}
```

localStorage/sessionStorage에서 초기값 계산, 데이터 구조(인덱스, 맵) 구축, DOM 읽기, 무거운 변환 수행 시 지연 초기화를 사용합니다.

단순 원시값(`useState(0)`), 직접 참조(`useState(props.value)`), 저렴한 리터럴(`useState({})`)의 경우 함수 형태가 불필요합니다.
