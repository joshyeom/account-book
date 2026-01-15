---
title: 깜빡임 없이 Hydration 불일치 방지
impact: MEDIUM
impactDescription: 시각적 깜빡임과 hydration 에러 방지
tags: rendering, ssr, hydration, localStorage, flicker
---

## 깜빡임 없이 Hydration 불일치 방지

클라이언트 측 저장소(localStorage, 쿠키)에 의존하는 콘텐츠를 렌더링할 때, React가 hydration하기 전에 DOM을 업데이트하는 동기 스크립트를 주입하여 SSR 오류와 hydration 후 깜빡임을 모두 방지합니다.

**잘못된 예 (SSR 오류 발생):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  // localStorage는 서버에서 사용 불가 - 에러 발생
  const theme = localStorage.getItem("theme") || "light";

  return <div className={theme}>{children}</div>;
}
```

`localStorage`가 undefined이므로 서버 측 렌더링이 실패합니다.

**잘못된 예 (시각적 깜빡임):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // hydration 후 실행 - 눈에 보이는 플래시 발생
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
    }
  }, []);

  return <div className={theme}>{children}</div>;
}
```

컴포넌트가 먼저 기본값(`light`)으로 렌더링된 후 hydration 후 업데이트되어 잘못된 콘텐츠가 눈에 띄게 깜빡입니다.

**올바른 예 (깜빡임 없음, hydration 불일치 없음):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-wrapper">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  );
}
```

인라인 스크립트는 요소를 표시하기 전에 동기적으로 실행되어 DOM이 이미 올바른 값을 갖도록 보장합니다. 깜빡임 없음, hydration 불일치 없음.

이 패턴은 테마 토글, 사용자 설정, 인증 상태 및 기본값 깜빡임 없이 즉시 렌더링되어야 하는 모든 클라이언트 전용 데이터에 특히 유용합니다.
