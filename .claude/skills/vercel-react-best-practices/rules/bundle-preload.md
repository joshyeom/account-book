---
title: 사용자 의도에 따른 프리로드
impact: MEDIUM
impactDescription: 체감 지연 시간 감소
tags: bundle, preload, user-intent, hover
---

## 사용자 의도에 따른 프리로드

체감 지연 시간을 줄이기 위해 필요하기 전에 무거운 번들을 프리로드합니다.

**예시 (hover/focus 시 프리로드):**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== "undefined") {
      void import("./monaco-editor");
    }
  };

  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      에디터 열기
    </button>
  );
}
```

**예시 (피처 플래그가 활성화되면 프리로드):**

```tsx
function FlagsProvider({ children, flags }: Props) {
  useEffect(() => {
    if (flags.editorEnabled && typeof window !== "undefined") {
      void import("./monaco-editor").then((mod) => mod.init());
    }
  }, [flags.editorEnabled]);

  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}
```

`typeof window !== 'undefined'` 체크는 프리로드되는 모듈이 SSR용으로 번들링되는 것을 방지하여 서버 번들 크기와 빌드 속도를 최적화합니다.
