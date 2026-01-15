---
title: 무거운 컴포넌트에 동적 임포트 사용
impact: CRITICAL
impactDescription: TTI와 LCP에 직접 영향
tags: bundle, dynamic-import, code-splitting, next-dynamic
---

## 무거운 컴포넌트에 동적 임포트 사용

초기 렌더링에 필요하지 않은 대용량 컴포넌트를 지연 로딩하기 위해 `next/dynamic`을 사용합니다.

**잘못된 예 (Monaco가 메인 청크에 ~300KB 포함):**

```tsx
import { MonacoEditor } from "./monaco-editor";

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />;
}
```

**올바른 예 (Monaco가 필요할 때 로드):**

```tsx
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("./monaco-editor").then((m) => m.MonacoEditor), {
  ssr: false,
});

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />;
}
```
