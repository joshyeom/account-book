# React 모범 사례

**버전 0.1.0**
Vercel 엔지니어링
2026년 1월

> **참고:**
> 이 문서는 주로 에이전트와 LLM이 Vercel에서 React 및 Next.js 코드베이스를
> 유지보수, 생성 또는 리팩토링할 때 따라야 할 지침입니다. 사람도 유용하게
> 사용할 수 있지만, 여기의 지침은 AI 지원 워크플로우에 의한 자동화와
> 일관성을 위해 최적화되어 있습니다.

---

## 요약

React 및 Next.js 애플리케이션을 위한 포괄적인 성능 최적화 가이드로, AI 에이전트와 LLM을 위해 설계되었습니다. 8개 카테고리에 걸쳐 40개 이상의 규칙을 포함하며, 중요도(워터폴 제거, 번들 크기 감소 등 치명적)부터 점진적(고급 패턴)까지 우선순위가 지정되어 있습니다. 각 규칙에는 상세한 설명, 잘못된 구현과 올바른 구현을 비교하는 실제 예제, 자동화된 리팩토링 및 코드 생성을 안내하는 구체적인 영향 지표가 포함되어 있습니다.

---

## 목차

1. [워터폴 제거](#1-워터폴-제거) — **치명적**
   - 1.1 [필요할 때까지 Await 지연](#11-필요할-때까지-await-지연)
   - 1.2 [의존성 기반 병렬화](#12-의존성-기반-병렬화)
   - 1.3 [API 라우트에서 워터폴 체인 방지](#13-api-라우트에서-워터폴-체인-방지)
   - 1.4 [독립적인 작업을 위한 Promise.all()](#14-독립적인-작업을-위한-promiseall)
   - 1.5 [전략적 Suspense 경계](#15-전략적-suspense-경계)
2. [번들 크기 최적화](#2-번들-크기-최적화) — **치명적**
   - 2.1 [배럴 파일 임포트 피하기](#21-배럴-파일-임포트-피하기)
   - 2.2 [조건부 모듈 로딩](#22-조건부-모듈-로딩)
   - 2.3 [중요하지 않은 서드파티 라이브러리 지연 로드](#23-중요하지-않은-서드파티-라이브러리-지연-로드)
   - 2.4 [무거운 컴포넌트를 위한 동적 임포트](#24-무거운-컴포넌트를-위한-동적-임포트)
   - 2.5 [사용자 의도에 기반한 프리로드](#25-사용자-의도에-기반한-프리로드)
3. [서버 사이드 성능](#3-서버-사이드-성능) — **높음**
   - 3.1 [요청 간 LRU 캐싱](#31-요청-간-lru-캐싱)
   - 3.2 [RSC 경계에서 직렬화 최소화](#32-rsc-경계에서-직렬화-최소화)
   - 3.3 [컴포넌트 합성을 통한 병렬 데이터 페칭](#33-컴포넌트-합성을-통한-병렬-데이터-페칭)
   - 3.4 [React.cache()를 사용한 요청별 중복 제거](#34-reactcache를-사용한-요청별-중복-제거)
   - 3.5 [비차단 작업을 위한 after() 사용](#35-비차단-작업을-위한-after-사용)
4. [클라이언트 사이드 데이터 페칭](#4-클라이언트-사이드-데이터-페칭) — **중간-높음**
   - 4.1 [글로벌 이벤트 리스너 중복 제거](#41-글로벌-이벤트-리스너-중복-제거)
   - 4.2 [자동 중복 제거를 위한 SWR 사용](#42-자동-중복-제거를-위한-swr-사용)
5. [재렌더링 최적화](#5-재렌더링-최적화) — **중간**
   - 5.1 [사용 시점까지 상태 읽기 지연](#51-사용-시점까지-상태-읽기-지연)
   - 5.2 [메모이제이션된 컴포넌트로 추출](#52-메모이제이션된-컴포넌트로-추출)
   - 5.3 [이펙트 의존성 좁히기](#53-이펙트-의존성-좁히기)
   - 5.4 [파생 상태 구독](#54-파생-상태-구독)
   - 5.5 [함수형 setState 업데이트 사용](#55-함수형-setstate-업데이트-사용)
   - 5.6 [지연 상태 초기화 사용](#56-지연-상태-초기화-사용)
   - 5.7 [긴급하지 않은 업데이트에 트랜지션 사용](#57-긴급하지-않은-업데이트에-트랜지션-사용)
6. [렌더링 성능](#6-렌더링-성능) — **중간**
   - 6.1 [SVG 요소 대신 래퍼 애니메이션](#61-svg-요소-대신-래퍼-애니메이션)
   - 6.2 [긴 리스트를 위한 CSS content-visibility](#62-긴-리스트를-위한-css-content-visibility)
   - 6.3 [정적 JSX 요소 호이스팅](#63-정적-jsx-요소-호이스팅)
   - 6.4 [SVG 정밀도 최적화](#64-svg-정밀도-최적화)
   - 6.5 [깜빡임 없이 하이드레이션 불일치 방지](#65-깜빡임-없이-하이드레이션-불일치-방지)
   - 6.6 [표시/숨김을 위한 Activity 컴포넌트 사용](#66-표시숨김을-위한-activity-컴포넌트-사용)
   - 6.7 [명시적 조건부 렌더링 사용](#67-명시적-조건부-렌더링-사용)
7. [JavaScript 성능](#7-javascript-성능) — **낮음-중간**
   - 7.1 [DOM CSS 변경 일괄 처리](#71-dom-css-변경-일괄-처리)
   - 7.2 [반복 조회를 위한 인덱스 맵 구축](#72-반복-조회를-위한-인덱스-맵-구축)
   - 7.3 [루프에서 속성 접근 캐시](#73-루프에서-속성-접근-캐시)
   - 7.4 [반복 함수 호출 캐시](#74-반복-함수-호출-캐시)
   - 7.5 [스토리지 API 호출 캐시](#75-스토리지-api-호출-캐시)
   - 7.6 [여러 배열 순회 결합](#76-여러-배열-순회-결합)
   - 7.7 [배열 비교 시 길이 먼저 확인](#77-배열-비교-시-길이-먼저-확인)
   - 7.8 [함수에서 조기 반환](#78-함수에서-조기-반환)
   - 7.9 [RegExp 생성 호이스팅](#79-regexp-생성-호이스팅)
   - 7.10 [정렬 대신 루프로 최소/최대 찾기](#710-정렬-대신-루프로-최소최대-찾기)
   - 7.11 [O(1) 조회를 위한 Set/Map 사용](#711-o1-조회를-위한-setmap-사용)
   - 7.12 [불변성을 위해 sort() 대신 toSorted() 사용](#712-불변성을-위해-sort-대신-tosorted-사용)
8. [고급 패턴](#8-고급-패턴) — **낮음**
   - 8.1 [이벤트 핸들러를 Ref에 저장](#81-이벤트-핸들러를-ref에-저장)
   - 8.2 [안정적인 콜백 Ref를 위한 useLatest](#82-안정적인-콜백-ref를-위한-uselatest)

---

## 1. 워터폴 제거

**영향: 치명적**

워터폴은 성능 저하의 가장 큰 원인입니다. 각각의 순차적 await는 전체 네트워크 지연 시간을 추가합니다. 이를 제거하면 가장 큰 성능 향상을 얻을 수 있습니다.

### 1.1 필요할 때까지 Await 지연

**영향: 높음 (사용되지 않는 코드 경로 차단 방지)**

`await` 작업을 실제로 필요한 분기 내부로 이동하여 필요하지 않은 코드 경로를 차단하지 않도록 합니다.

**잘못된 예: 두 분기 모두 차단**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId);

  if (skipProcessing) {
    // 즉시 반환하지만 여전히 userData를 기다림
    return { skipped: true };
  }

  // 이 분기만 userData를 사용
  return processUserData(userData);
}
```

**올바른 예: 필요할 때만 차단**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // 기다림 없이 즉시 반환
    return { skipped: true };
  }

  // 필요할 때만 페치
  const userData = await fetchUserData(userId);
  return processUserData(userData);
}
```

**또 다른 예: 조기 반환 최적화**

```typescript
// 잘못된 예: 항상 권한을 페치
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId);
  const resource = await getResource(resourceId);

  if (!resource) {
    return { error: "Not found" };
  }

  if (!permissions.canEdit) {
    return { error: "Forbidden" };
  }

  return await updateResourceData(resource, permissions);
}

// 올바른 예: 필요할 때만 페치
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId);

  if (!resource) {
    return { error: "Not found" };
  }

  const permissions = await fetchPermissions(userId);

  if (!permissions.canEdit) {
    return { error: "Forbidden" };
  }

  return await updateResourceData(resource, permissions);
}
```

이 최적화는 건너뛰는 분기가 자주 사용되거나 지연된 작업이 비용이 많이 들 때 특히 유용합니다.

### 1.2 의존성 기반 병렬화

**영향: 치명적 (2-10배 개선)**

부분적인 의존성이 있는 작업의 경우, `better-all`을 사용하여 병렬성을 최대화합니다. 각 작업을 가능한 가장 빠른 시점에 자동으로 시작합니다.

**잘못된 예: profile이 config를 불필요하게 기다림**

```typescript
const [user, config] = await Promise.all([fetchUser(), fetchConfig()]);
const profile = await fetchProfile(user.id);
```

**올바른 예: config와 profile이 병렬로 실행**

```typescript
import { all } from "better-all";

const { user, config, profile } = await all({
  async user() {
    return fetchUser();
  },
  async config() {
    return fetchConfig();
  },
  async profile() {
    return fetchProfile((await this.$.user).id);
  },
});
```

참고: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)

### 1.3 API 라우트에서 워터폴 체인 방지

**영향: 치명적 (2-10배 개선)**

API 라우트와 Server Actions에서 독립적인 작업을 즉시 시작합니다. 아직 await하지 않더라도요.

**잘못된 예: config가 auth를 기다리고, data가 둘 다 기다림**

```typescript
export async function GET(request: Request) {
  const session = await auth();
  const config = await fetchConfig();
  const data = await fetchData(session.user.id);
  return Response.json({ data, config });
}
```

**올바른 예: auth와 config가 즉시 시작**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth();
  const configPromise = fetchConfig();
  const session = await sessionPromise;
  const [config, data] = await Promise.all([configPromise, fetchData(session.user.id)]);
  return Response.json({ data, config });
}
```

더 복잡한 의존성 체인이 있는 작업의 경우, `better-all`을 사용하여 자동으로 병렬성을 최대화합니다 (의존성 기반 병렬화 참조).

### 1.4 독립적인 작업을 위한 Promise.all()

**영향: 치명적 (2-10배 개선)**

비동기 작업에 상호 의존성이 없을 때, `Promise.all()`을 사용하여 동시에 실행합니다.

**잘못된 예: 순차 실행, 3번의 라운드 트립**

```typescript
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();
```

**올바른 예: 병렬 실행, 1번의 라운드 트립**

```typescript
const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()]);
```

### 1.5 전략적 Suspense 경계

**영향: 높음 (더 빠른 초기 페인트)**

비동기 컴포넌트에서 JSX를 반환하기 전에 데이터를 await하는 대신, Suspense 경계를 사용하여 데이터가 로드되는 동안 래퍼 UI를 더 빨리 표시합니다.

**잘못된 예: 래퍼가 데이터 페칭에 의해 차단됨**

```tsx
async function Page() {
  const data = await fetchData(); // 전체 페이지 차단

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  );
}
```

전체 레이아웃이 데이터를 기다리지만 중간 섹션만 데이터가 필요합니다.

**올바른 예: 래퍼가 즉시 표시되고, 데이터가 스트리밍됨**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  );
}

async function DataDisplay() {
  const data = await fetchData(); // 이 컴포넌트만 차단
  return <div>{data.content}</div>;
}
```

Sidebar, Header, Footer가 즉시 렌더링됩니다. DataDisplay만 데이터를 기다립니다.

**대안: 컴포넌트 간 프로미스 공유**

```tsx
function Page() {
  // 페치를 즉시 시작하지만 await하지 않음
  const dataPromise = fetchData();

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <Suspense fallback={<Skeleton />}>
        <DataDisplay dataPromise={dataPromise} />
        <DataSummary dataPromise={dataPromise} />
      </Suspense>
      <div>Footer</div>
    </div>
  );
}

function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise); // 프로미스 언랩
  return <div>{data.content}</div>;
}

function DataSummary({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise); // 같은 프로미스 재사용
  return <div>{data.summary}</div>;
}
```

두 컴포넌트가 같은 프로미스를 공유하므로 페치는 한 번만 발생합니다. 레이아웃이 즉시 렌더링되고 두 컴포넌트가 함께 기다립니다.

**이 패턴을 사용하지 말아야 할 때:**

- 레이아웃 결정에 필요한 중요 데이터 (위치 지정에 영향)

- 폴드 위의 SEO 중요 콘텐츠

- Suspense 오버헤드가 가치 없는 작고 빠른 쿼리

- 레이아웃 시프트를 피하고 싶을 때 (로딩 → 콘텐츠 점프)

**트레이드오프:** 더 빠른 초기 페인트 vs 잠재적 레이아웃 시프트. UX 우선순위에 따라 선택하세요.

---

## 2. 번들 크기 최적화

**영향: 치명적**

초기 번들 크기를 줄이면 상호작용 시간(TTI)과 최대 콘텐츠풀 페인트(LCP)가 개선됩니다.

### 2.1 배럴 파일 임포트 피하기

**영향: 치명적 (200-800ms 임포트 비용, 느린 빌드)**

사용하지 않는 수천 개의 모듈을 로드하지 않도록 배럴 파일 대신 소스 파일에서 직접 임포트합니다. **배럴 파일**은 여러 모듈을 재내보내는 진입점입니다 (예: `export * from './module'`을 수행하는 `index.js`).

인기 있는 아이콘 및 컴포넌트 라이브러리는 진입 파일에 **최대 10,000개의 재내보내기**가 있을 수 있습니다. 많은 React 패키지의 경우, **임포트하는 데만 200-800ms가 걸리며**, 이는 개발 속도와 프로덕션 콜드 스타트 모두에 영향을 미칩니다.

**트리 쉐이킹이 도움이 되지 않는 이유:** 라이브러리가 외부(번들되지 않음)로 표시되면 번들러가 최적화할 수 없습니다. 트리 쉐이킹을 활성화하기 위해 번들하면 전체 모듈 그래프를 분석하느라 빌드가 상당히 느려집니다.

**잘못된 예: 전체 라이브러리 임포트**

```tsx
// 1,583개 모듈 로드, 개발 시 ~2.8초 추가
// 런타임 비용: 매 콜드 스타트마다 200-800ms

import { Button, TextField } from "@mui/material";
import { Check, Menu, X } from "lucide-react";

// 2,225개 모듈 로드, 개발 시 ~4.2초 추가
```

**올바른 예: 필요한 것만 임포트**

```tsx
// 3개 모듈만 로드 (~2KB vs ~1MB)

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Check from "lucide-react/dist/esm/icons/check";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";

// 사용하는 것만 로드
```

**대안: Next.js 13.5+**

```js
// 그러면 편리한 배럴 임포트를 유지할 수 있습니다:
import { Check, Menu, X } from "lucide-react";

// next.config.js - optimizePackageImports 사용
module.exports = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@mui/material"],
  },
};

// 빌드 시 자동으로 직접 임포트로 변환됨
```

직접 임포트는 15-70% 더 빠른 개발 부트, 28% 더 빠른 빌드, 40% 더 빠른 콜드 스타트, 상당히 빠른 HMR을 제공합니다.

일반적으로 영향받는 라이브러리: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@headlessui/react`, `@radix-ui/react-*`, `lodash`, `ramda`, `date-fns`, `rxjs`, `react-use`.

참고: [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)

### 2.2 조건부 모듈 로딩

**영향: 높음 (필요할 때만 큰 데이터 로드)**

기능이 활성화될 때만 큰 데이터나 모듈을 로드합니다.

**예: 애니메이션 프레임 지연 로드**

```tsx
function AnimationPlayer({ enabled }: { enabled: boolean }) {
  const [frames, setFrames] = useState<Frame[] | null>(null);

  useEffect(() => {
    if (enabled && !frames && typeof window !== "undefined") {
      import("./animation-frames.js")
        .then((mod) => setFrames(mod.frames))
        .catch(() => setEnabled(false));
    }
  }, [enabled, frames]);

  if (!frames) return <Skeleton />;
  return <Canvas frames={frames} />;
}
```

`typeof window !== 'undefined'` 체크는 이 모듈이 SSR용으로 번들되는 것을 방지하여 서버 번들 크기와 빌드 속도를 최적화합니다.

### 2.3 중요하지 않은 서드파티 라이브러리 지연 로드

**영향: 중간 (하이드레이션 후 로드)**

분석, 로깅, 오류 추적은 사용자 상호작용을 차단하지 않습니다. 하이드레이션 후에 로드합니다.

**잘못된 예: 초기 번들 차단**

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**올바른 예: 하이드레이션 후 로드**

```tsx
import dynamic from "next/dynamic";

const Analytics = dynamic(() => import("@vercel/analytics/react").then((m) => m.Analytics), {
  ssr: false,
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2.4 무거운 컴포넌트를 위한 동적 임포트

**영향: 치명적 (TTI와 LCP에 직접 영향)**

초기 렌더링에 필요하지 않은 큰 컴포넌트를 지연 로드하려면 `next/dynamic`을 사용합니다.

**잘못된 예: Monaco가 메인 청크와 함께 번들됨 ~300KB**

```tsx
import { MonacoEditor } from "./monaco-editor";

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />;
}
```

**올바른 예: Monaco가 필요 시 로드**

```tsx
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("./monaco-editor").then((m) => m.MonacoEditor), {
  ssr: false,
});

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />;
}
```

### 2.5 사용자 의도에 기반한 프리로드

**영향: 중간 (체감 지연 감소)**

체감 지연을 줄이기 위해 무거운 번들을 필요하기 전에 프리로드합니다.

**예: 호버/포커스 시 프리로드**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== "undefined") {
      void import("./monaco-editor");
    }
  };

  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      Open Editor
    </button>
  );
}
```

**예: 기능 플래그가 활성화되면 프리로드**

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

`typeof window !== 'undefined'` 체크는 프리로드된 모듈이 SSR용으로 번들되는 것을 방지하여 서버 번들 크기와 빌드 속도를 최적화합니다.

---

## 3. 서버 사이드 성능

**영향: 높음**

서버 사이드 렌더링과 데이터 페칭을 최적화하면 서버 사이드 워터폴을 제거하고 응답 시간을 줄입니다.

### 3.1 요청 간 LRU 캐싱

**영향: 높음 (요청 간 캐시)**

`React.cache()`는 하나의 요청 내에서만 작동합니다. 순차적 요청 간에 공유되는 데이터의 경우 (사용자가 버튼 A를 클릭한 다음 버튼 B를 클릭), LRU 캐시를 사용합니다.

**구현:**

```typescript
import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5분
});

export async function getUser(id: string) {
  const cached = cache.get(id);
  if (cached) return cached;

  const user = await db.user.findUnique({ where: { id } });
  cache.set(id, user);
  return user;
}

// 요청 1: DB 쿼리, 결과 캐시됨
// 요청 2: 캐시 히트, DB 쿼리 없음
```

순차적 사용자 행동이 몇 초 내에 같은 데이터가 필요한 여러 엔드포인트를 호출할 때 사용합니다.

**Vercel의 [Fluid Compute](https://vercel.com/docs/fluid-compute) 사용 시:** 여러 동시 요청이 같은 함수 인스턴스와 캐시를 공유할 수 있으므로 LRU 캐싱이 특히 효과적입니다. 이는 Redis와 같은 외부 스토리지 없이도 캐시가 요청 간에 지속된다는 것을 의미합니다.

**전통적인 서버리스에서:** 각 호출이 격리되어 실행되므로 프로세스 간 캐싱을 위해 Redis를 고려하세요.

참고: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)

### 3.2 RSC 경계에서 직렬화 최소화

**영향: 높음 (데이터 전송 크기 감소)**

React Server/Client 경계는 모든 객체 속성을 문자열로 직렬화하여 HTML 응답과 후속 RSC 요청에 포함합니다. 이 직렬화된 데이터는 페이지 가중치와 로드 시간에 직접 영향을 미치므로 **크기가 매우 중요합니다**. 클라이언트가 실제로 사용하는 필드만 전달합니다.

**잘못된 예: 50개 필드 모두 직렬화**

```tsx
async function Page() {
  const user = await fetchUser(); // 50개 필드
  return <Profile user={user} />;
}

("use client");
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>; // 1개 필드 사용
}
```

**올바른 예: 1개 필드만 직렬화**

```tsx
async function Page() {
  const user = await fetchUser();
  return <Profile name={user.name} />;
}

("use client");
function Profile({ name }: { name: string }) {
  return <div>{name}</div>;
}
```

### 3.3 컴포넌트 합성을 통한 병렬 데이터 페칭

**영향: 치명적 (서버 사이드 워터폴 제거)**

React Server Components는 트리 내에서 순차적으로 실행됩니다. 데이터 페칭을 병렬화하려면 합성으로 재구성합니다.

**잘못된 예: Sidebar가 Page의 페치 완료를 기다림**

```tsx
export default async function Page() {
  const header = await fetchHeader();
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  );
}

async function Sidebar() {
  const items = await fetchSidebarItems();
  return <nav>{items.map(renderItem)}</nav>;
}
```

**올바른 예: 둘 다 동시에 페치**

```tsx
async function Header() {
  const data = await fetchHeader();
  return <div>{data}</div>;
}

async function Sidebar() {
  const items = await fetchSidebarItems();
  return <nav>{items.map(renderItem)}</nav>;
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  );
}
```

**children prop을 사용한 대안:**

```tsx
async function Layout({ children }: { children: ReactNode }) {
  const header = await fetchHeader();
  return (
    <div>
      <div>{header}</div>
      {children}
    </div>
  );
}

async function Sidebar() {
  const items = await fetchSidebarItems();
  return <nav>{items.map(renderItem)}</nav>;
}

export default function Page() {
  return (
    <Layout>
      <Sidebar />
    </Layout>
  );
}
```

### 3.4 React.cache()를 사용한 요청별 중복 제거

**영향: 중간 (요청 내 중복 제거)**

서버 사이드 요청 중복 제거를 위해 `React.cache()`를 사용합니다. 인증과 데이터베이스 쿼리가 가장 큰 이점을 얻습니다.

**사용법:**

```typescript
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return await db.user.findUnique({
    where: { id: session.user.id },
  });
});
```

단일 요청 내에서 `getCurrentUser()`에 대한 여러 호출은 쿼리를 한 번만 실행합니다.

### 3.5 비차단 작업을 위한 after() 사용

**영향: 중간 (더 빠른 응답 시간)**

응답이 전송된 후 실행해야 하는 작업을 예약하려면 Next.js의 `after()`를 사용합니다. 이는 로깅, 분석 및 기타 부수 효과가 응답을 차단하는 것을 방지합니다.

**잘못된 예: 응답 차단**

```tsx
import { logUserAction } from "@/app/utils";

export async function POST(request: Request) {
  // 뮤테이션 수행
  await updateDatabase(request);

  // 로깅이 응답을 차단
  const userAgent = request.headers.get("user-agent") || "unknown";
  await logUserAction({ userAgent });

  return new Response(JSON.stringify({ status: "success" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

**올바른 예: 비차단**

```tsx
import { cookies, headers } from "next/headers";
import { after } from "next/server";

import { logUserAction } from "@/app/utils";

export async function POST(request: Request) {
  // 뮤테이션 수행
  await updateDatabase(request);

  // 응답 전송 후 로그
  after(async () => {
    const userAgent = (await headers()).get("user-agent") || "unknown";
    const sessionCookie = (await cookies()).get("session-id")?.value || "anonymous";

    logUserAction({ sessionCookie, userAgent });
  });

  return new Response(JSON.stringify({ status: "success" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

응답이 즉시 전송되고 로깅은 백그라운드에서 발생합니다.

**일반적인 사용 사례:**

- 분석 추적

- 감사 로깅

- 알림 전송

- 캐시 무효화

- 정리 작업

**중요 참고:**

- `after()`는 응답이 실패하거나 리다이렉트되더라도 실행됩니다

- Server Actions, Route Handlers, Server Components에서 작동합니다

참고: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)

---

## 4. 클라이언트 사이드 데이터 페칭

**영향: 중간-높음**

자동 중복 제거와 효율적인 데이터 페칭 패턴은 중복 네트워크 요청을 줄입니다.

### 4.1 글로벌 이벤트 리스너 중복 제거

**영향: 낮음 (N개 컴포넌트에 단일 리스너)**

컴포넌트 인스턴스 간에 글로벌 이벤트 리스너를 공유하려면 `useSWRSubscription()`을 사용합니다.

**잘못된 예: N개 인스턴스 = N개 리스너**

```tsx
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === key) {
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback]);
}
```

`useKeyboardShortcut` 훅을 여러 번 사용하면 각 인스턴스가 새 리스너를 등록합니다.

**올바른 예: N개 인스턴스 = 1개 리스너**

```tsx
import useSWRSubscription from "swr/subscription";

// 모듈 레벨 Map으로 키별 콜백 추적
const keyCallbacks = new Map<string, Set<() => void>>();

function useKeyboardShortcut(key: string, callback: () => void) {
  // Map에 이 콜백 등록
  useEffect(() => {
    if (!keyCallbacks.has(key)) {
      keyCallbacks.set(key, new Set());
    }
    keyCallbacks.get(key)!.add(callback);

    return () => {
      const set = keyCallbacks.get(key);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          keyCallbacks.delete(key);
        }
      }
    };
  }, [key, callback]);

  useSWRSubscription("global-keydown", () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && keyCallbacks.has(e.key)) {
        keyCallbacks.get(e.key)!.forEach((cb) => cb());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
}

function Profile() {
  // 여러 단축키가 같은 리스너를 공유
  useKeyboardShortcut("p", () => {
    /* ... */
  });
  useKeyboardShortcut("k", () => {
    /* ... */
  });
  // ...
}
```

### 4.2 자동 중복 제거를 위한 SWR 사용

**영향: 중간-높음 (자동 중복 제거)**

SWR은 컴포넌트 인스턴스 간 요청 중복 제거, 캐싱 및 재검증을 가능하게 합니다.

**잘못된 예: 중복 제거 없음, 각 인스턴스가 페치**

```tsx
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);
}
```

**올바른 예: 여러 인스턴스가 하나의 요청 공유**

```tsx
import useSWR from "swr";

function UserList() {
  const { data: users } = useSWR("/api/users", fetcher);
}
```

**불변 데이터의 경우:**

```tsx
import { useImmutableSWR } from "@/lib/swr";

function StaticContent() {
  const { data } = useImmutableSWR("/api/config", fetcher);
}
```

**뮤테이션의 경우:**

```tsx
import { useSWRMutation } from "swr/mutation";

function UpdateButton() {
  const { trigger } = useSWRMutation("/api/user", updateUser);
  return <button onClick={() => trigger()}>Update</button>;
}
```

참고: [https://swr.vercel.app](https://swr.vercel.app)

---

## 5. 재렌더링 최적화

**영향: 중간**

불필요한 재렌더링을 줄이면 낭비되는 계산을 최소화하고 UI 응답성이 향상됩니다.

### 5.1 사용 시점까지 상태 읽기 지연

**영향: 중간 (불필요한 구독 방지)**

콜백 내에서만 읽는다면 동적 상태 (searchParams, localStorage)를 구독하지 마세요.

**잘못된 예: 모든 searchParams 변경을 구독**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams();

  const handleShare = () => {
    const ref = searchParams.get("ref");
    shareChat(chatId, { ref });
  };

  return <button onClick={handleShare}>Share</button>;
}
```

**올바른 예: 필요 시 읽기, 구독 없음**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    shareChat(chatId, { ref });
  };

  return <button onClick={handleShare}>Share</button>;
}
```

### 5.2 메모이제이션된 컴포넌트로 추출

**영향: 중간 (조기 반환 가능)**

비용이 많이 드는 작업을 메모이제이션된 컴포넌트로 추출하여 계산 전에 조기 반환을 가능하게 합니다.

**잘못된 예: 로딩 중에도 아바타 계산**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user);
    return <Avatar id={id} />;
  }, [user]);

  if (loading) return <Skeleton />;
  return <div>{avatar}</div>;
}
```

**올바른 예: 로딩 시 계산 건너뜀**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user]);
  return <Avatar id={id} />;
});

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />;
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  );
}
```

**참고:** 프로젝트에 [React Compiler](https://react.dev/learn/react-compiler)가 활성화되어 있다면, `memo()` 및 `useMemo()`를 사용한 수동 메모이제이션은 필요하지 않습니다. 컴파일러가 자동으로 재렌더링을 최적화합니다.

### 5.3 이펙트 의존성 좁히기

**영향: 낮음 (이펙트 재실행 최소화)**

이펙트 재실행을 최소화하려면 객체 대신 원시 의존성을 지정합니다.

**잘못된 예: user 필드 변경 시 재실행**

```tsx
useEffect(() => {
  console.log(user.id);
}, [user]);
```

**올바른 예: id 변경 시에만 재실행**

```tsx
useEffect(() => {
  console.log(user.id);
}, [user.id]);
```

**파생 상태의 경우, 이펙트 외부에서 계산:**

```tsx
// 잘못된 예: width=767, 766, 765...에서 실행
useEffect(() => {
  if (width < 768) {
    enableMobileMode();
  }
}, [width]);

// 올바른 예: boolean 전환 시에만 실행
const isMobile = width < 768;
useEffect(() => {
  if (isMobile) {
    enableMobileMode();
  }
}, [isMobile]);
```

### 5.4 파생 상태 구독

**영향: 중간 (재렌더링 빈도 감소)**

재렌더링 빈도를 줄이려면 연속 값 대신 파생된 boolean 상태를 구독합니다.

**잘못된 예: 매 픽셀 변경마다 재렌더링**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // 지속적으로 업데이트
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'}>
}
```

**올바른 예: boolean 변경 시에만 재렌더링**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'}>
}
```

### 5.5 함수형 setState 업데이트 사용

**영향: 중간 (스테일 클로저 및 불필요한 콜백 재생성 방지)**

현재 상태 값을 기반으로 상태를 업데이트할 때, 상태 변수를 직접 참조하는 대신 setState의 함수형 업데이트 형태를 사용합니다. 이는 스테일 클로저를 방지하고, 불필요한 의존성을 제거하며, 안정적인 콜백 참조를 생성합니다.

**잘못된 예: 상태를 의존성으로 필요**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems);

  // 콜백이 items에 의존해야 함, 매 items 변경마다 재생성
  const addItems = useCallback(
    (newItems: Item[]) => {
      setItems([...items, ...newItems]);
    },
    [items]
  ); // ❌ items 의존성이 재생성 유발

  // 의존성을 잊으면 스테일 클로저 위험
  const removeItem = useCallback((id: string) => {
    setItems(items.filter((item) => item.id !== id));
  }, []); // ❌ items 의존성 누락 - 스테일 items 사용!

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />;
}
```

첫 번째 콜백은 `items`가 변경될 때마다 재생성되어 자식 컴포넌트가 불필요하게 재렌더링될 수 있습니다. 두 번째 콜백은 스테일 클로저 버그가 있어 항상 초기 `items` 값을 참조합니다.

**올바른 예: 안정적인 콜백, 스테일 클로저 없음**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems);

  // 안정적인 콜백, 재생성되지 않음
  const addItems = useCallback((newItems: Item[]) => {
    setItems((curr) => [...curr, ...newItems]);
  }, []); // ✅ 의존성 필요 없음

  // 항상 최신 상태 사용, 스테일 클로저 위험 없음
  const removeItem = useCallback((id: string) => {
    setItems((curr) => curr.filter((item) => item.id !== id));
  }, []); // ✅ 안전하고 안정적

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />;
}
```

**이점:**

1. **안정적인 콜백 참조** - 상태가 변경되어도 콜백을 재생성할 필요 없음

2. **스테일 클로저 없음** - 항상 최신 상태 값에서 작동

3. **적은 의존성** - 의존성 배열을 단순화하고 메모리 누수 감소

4. **버그 방지** - React 클로저 버그의 가장 일반적인 원인 제거

**함수형 업데이트를 사용해야 할 때:**

- 현재 상태 값에 의존하는 모든 setState

- 상태가 필요한 useCallback/useMemo 내부

- 상태를 참조하는 이벤트 핸들러

- 상태를 업데이트하는 비동기 작업

**직접 업데이트가 괜찮을 때:**

- 정적 값으로 상태 설정: `setCount(0)`

- props/인자에서만 상태 설정: `setName(newName)`

- 상태가 이전 값에 의존하지 않을 때

**참고:** 프로젝트에 [React Compiler](https://react.dev/learn/react-compiler)가 활성화되어 있다면, 컴파일러가 일부 경우를 자동으로 최적화할 수 있지만, 정확성과 스테일 클로저 버그 방지를 위해 함수형 업데이트가 여전히 권장됩니다.

### 5.6 지연 상태 초기화 사용

**영향: 중간 (매 렌더마다 낭비되는 계산)**

비용이 많이 드는 초기 값에는 `useState`에 함수를 전달합니다. 함수 형태 없이는 값이 한 번만 사용되더라도 초기화기가 매 렌더마다 실행됩니다.

**잘못된 예: 매 렌더마다 실행**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()가 초기화 후에도 매 렌더마다 실행
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

**올바른 예: 한 번만 실행**

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

localStorage/sessionStorage에서 초기 값을 계산하거나, 데이터 구조(인덱스, 맵)를 구축하거나, DOM에서 읽거나, 무거운 변환을 수행할 때 지연 초기화를 사용합니다.

단순 원시 값(`useState(0)`), 직접 참조(`useState(props.value)`), 또는 저렴한 리터럴(`useState({})`)의 경우 함수 형태는 불필요합니다.

### 5.7 긴급하지 않은 업데이트에 트랜지션 사용

**영향: 중간 (UI 응답성 유지)**

빈번하고 긴급하지 않은 상태 업데이트를 트랜지션으로 표시하여 UI 응답성을 유지합니다.

**잘못된 예: 매 스크롤마다 UI 차단**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}
```

**올바른 예: 비차단 업데이트**

```tsx
import { startTransition } from "react";

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}
```

---

## 6. 렌더링 성능

**영향: 중간**

렌더링 프로세스를 최적화하면 브라우저가 수행해야 하는 작업이 줄어듭니다.

### 6.1 SVG 요소 대신 래퍼 애니메이션

**영향: 낮음 (하드웨어 가속 가능)**

많은 브라우저는 SVG 요소에 대한 CSS3 애니메이션에 하드웨어 가속이 없습니다. SVG를 `<div>`로 감싸고 대신 래퍼를 애니메이션합니다.

**잘못된 예: SVG 직접 애니메이션 - 하드웨어 가속 없음**

```tsx
function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
    </svg>
  );
}
```

**올바른 예: 래퍼 div 애니메이션 - 하드웨어 가속됨**

```tsx
function LoadingSpinner() {
  return (
    <div className="animate-spin">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    </div>
  );
}
```

이는 모든 CSS transforms 및 transitions (`transform`, `opacity`, `translate`, `scale`, `rotate`)에 적용됩니다. 래퍼 div는 브라우저가 더 부드러운 애니메이션을 위해 GPU 가속을 사용할 수 있게 합니다.

### 6.2 긴 리스트를 위한 CSS content-visibility

**영향: 높음 (더 빠른 초기 렌더링)**

오프스크린 렌더링을 지연하려면 `content-visibility: auto`를 적용합니다.

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**예:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="h-screen overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className="message-item">
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  );
}
```

1000개 메시지의 경우, 브라우저가 ~990개 오프스크린 항목의 레이아웃/페인트를 건너뜁니다 (10배 더 빠른 초기 렌더링).

### 6.3 정적 JSX 요소 호이스팅

**영향: 낮음 (재생성 방지)**

재생성을 피하려면 정적 JSX를 컴포넌트 외부로 추출합니다.

**잘못된 예: 매 렌더마다 요소 재생성**

```tsx
function LoadingSkeleton() {
  return <div className="h-20 animate-pulse bg-gray-200" />;
}

function Container() {
  return <div>{loading && <LoadingSkeleton />}</div>;
}
```

**올바른 예: 같은 요소 재사용**

```tsx
const loadingSkeleton = <div className="h-20 animate-pulse bg-gray-200" />;

function Container() {
  return <div>{loading && loadingSkeleton}</div>;
}
```

이는 매 렌더마다 재생성하기 비용이 많이 들 수 있는 크고 정적인 SVG 노드에 특히 유용합니다.

**참고:** 프로젝트에 [React Compiler](https://react.dev/learn/react-compiler)가 활성화되어 있다면, 컴파일러가 자동으로 정적 JSX 요소를 호이스팅하고 컴포넌트 재렌더링을 최적화하여 수동 호이스팅이 불필요합니다.

### 6.4 SVG 정밀도 최적화

**영향: 낮음 (파일 크기 감소)**

파일 크기를 줄이려면 SVG 좌표 정밀도를 줄입니다. 최적의 정밀도는 viewBox 크기에 따라 다르지만, 일반적으로 정밀도 감소를 고려해야 합니다.

**잘못된 예: 과도한 정밀도**

```svg
<path d="M 10.293847 20.847362 L 30.938472 40.192837" />
```

**올바른 예: 소수점 1자리**

```svg
<path d="M 10.3 20.8 L 30.9 40.2" />
```

**SVGO로 자동화:**

```bash
npx svgo --precision=1 --multipass icon.svg
```

### 6.5 깜빡임 없이 하이드레이션 불일치 방지

**영향: 중간 (시각적 깜빡임과 하이드레이션 오류 방지)**

클라이언트 사이드 스토리지(localStorage, 쿠키)에 의존하는 콘텐츠를 렌더링할 때, React가 하이드레이트하기 전에 DOM을 업데이트하는 동기 스크립트를 주입하여 SSR 손상과 하이드레이션 후 깜빡임을 모두 피합니다.

**잘못된 예: SSR 손상**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  // localStorage는 서버에서 사용 불가 - 오류 발생
  const theme = localStorage.getItem("theme") || "light";

  return <div className={theme}>{children}</div>;
}
```

`localStorage`가 정의되지 않아 서버 사이드 렌더링이 실패합니다.

**잘못된 예: 시각적 깜빡임**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // 하이드레이션 후 실행 - 보이는 플래시 유발
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
    }
  }, []);

  return <div className={theme}>{children}</div>;
}
```

컴포넌트가 먼저 기본값(`light`)으로 렌더링한 다음 하이드레이션 후 업데이트하여 잘못된 콘텐츠가 보이는 플래시를 유발합니다.

**올바른 예: 깜빡임 없음, 하이드레이션 불일치 없음**

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

인라인 스크립트가 요소를 표시하기 전에 동기적으로 실행되어 DOM이 이미 올바른 값을 갖도록 보장합니다. 깜빡임 없음, 하이드레이션 불일치 없음.

이 패턴은 테마 토글, 사용자 기본 설정, 인증 상태, 기본값 플래싱 없이 즉시 렌더링해야 하는 모든 클라이언트 전용 데이터에 특히 유용합니다.

### 6.6 표시/숨김을 위한 Activity 컴포넌트 사용

**영향: 중간 (상태/DOM 보존)**

자주 가시성이 토글되는 비용이 많이 드는 컴포넌트의 상태/DOM을 보존하려면 React의 `<Activity>`를 사용합니다.

**사용법:**

```tsx
import { Activity } from "react";

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? "visible" : "hidden"}>
      <ExpensiveMenu />
    </Activity>
  );
}
```

비용이 많이 드는 재렌더링과 상태 손실을 방지합니다.

### 6.7 명시적 조건부 렌더링 사용

**영향: 낮음 (0이나 NaN 렌더링 방지)**

조건이 `0`, `NaN`, 또는 렌더링되는 다른 falsy 값일 수 있을 때 조건부 렌더링에 `&&` 대신 명시적 삼항 연산자(`? :`)를 사용합니다.

**잘못된 예: count가 0일 때 "0" 렌더링**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count && <span className="badge">{count}</span>}</div>;
}

// count = 0일 때, 렌더링: <div>0</div>
// count = 5일 때, 렌더링: <div><span class="badge">5</span></div>
```

**올바른 예: count가 0일 때 아무것도 렌더링하지 않음**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count > 0 ? <span className="badge">{count}</span> : null}</div>;
}

// count = 0일 때, 렌더링: <div></div>
// count = 5일 때, 렌더링: <div><span class="badge">5</span></div>
```

---

## 7. JavaScript 성능

**영향: 낮음-중간**

핫 패스에 대한 마이크로 최적화는 의미 있는 개선으로 합산될 수 있습니다.

### 7.1 DOM CSS 변경 일괄 처리

**영향: 중간 (리플로우/리페인트 감소)**

스타일을 한 속성씩 변경하는 것을 피합니다. 브라우저 리플로우를 최소화하려면 클래스나 `cssText`를 통해 여러 CSS 변경을 그룹화합니다.

**잘못된 예: 여러 리플로우**

```typescript
function updateElementStyles(element: HTMLElement) {
  // 각 줄이 리플로우를 트리거
  element.style.width = "100px";
  element.style.height = "200px";
  element.style.backgroundColor = "blue";
  element.style.border = "1px solid black";
}
```

**올바른 예: 클래스 추가 - 단일 리플로우**

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

**올바른 예: cssText 변경 - 단일 리플로우**

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

**React 예:**

```tsx
// 잘못된 예: 스타일 하나씩 변경
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = "100px";
      ref.current.style.height = "200px";
      ref.current.style.backgroundColor = "blue";
    }
  }, [isHighlighted]);

  return <div ref={ref}>Content</div>;
}

// 올바른 예: 클래스 토글
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  return <div className={isHighlighted ? "highlighted-box" : ""}>Content</div>;
}
```

가능하면 인라인 스타일보다 CSS 클래스를 선호합니다. 클래스는 브라우저에 의해 캐시되고 관심사 분리가 더 잘 됩니다.

### 7.2 반복 조회를 위한 인덱스 맵 구축

**영향: 낮음-중간 (100만 연산 → 2천 연산)**

같은 키로 여러 `.find()` 호출은 Map을 사용해야 합니다.

**잘못된 예 (조회당 O(n)):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  return orders.map((order) => ({
    ...order,
    user: users.find((u) => u.id === order.userId),
  }));
}
```

**올바른 예 (조회당 O(1)):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map((u) => [u.id, u]));

  return orders.map((order) => ({
    ...order,
    user: userById.get(order.userId),
  }));
}
```

맵을 한 번 구축(O(n))하면 모든 조회가 O(1)입니다.

1000개 주문 × 1000명 사용자의 경우: 100만 연산 → 2천 연산.

### 7.3 루프에서 속성 접근 캐시

**영향: 낮음-중간 (조회 감소)**

핫 패스에서 객체 속성 조회를 캐시합니다.

**잘못된 예: 3번 조회 × N번 반복**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value);
}
```

**올바른 예: 총 1번 조회**

```typescript
const value = obj.config.settings.value;
const len = arr.length;
for (let i = 0; i < len; i++) {
  process(value);
}
```

### 7.4 반복 함수 호출 캐시

**영향: 중간 (중복 계산 방지)**

렌더 중에 같은 입력으로 같은 함수가 반복적으로 호출될 때 함수 결과를 캐시하려면 모듈 레벨 Map을 사용합니다.

**잘못된 예: 중복 계산**

```typescript
function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // slugify()가 같은 프로젝트 이름에 대해 100번 이상 호출됨
        const slug = slugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**올바른 예: 캐시된 결과**

```typescript
// 모듈 레벨 캐시
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // 고유한 프로젝트 이름당 한 번만 계산
        const slug = cachedSlugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**단일 값 함수를 위한 더 간단한 패턴:**

```typescript
let isLoggedInCache: boolean | null = null;

function isLoggedIn(): boolean {
  if (isLoggedInCache !== null) {
    return isLoggedInCache;
  }

  isLoggedInCache = document.cookie.includes("auth=");
  return isLoggedInCache;
}

// 인증 변경 시 캐시 지우기
function onAuthChange() {
  isLoggedInCache = null;
}
```

Map(훅이 아님)을 사용하여 유틸리티, 이벤트 핸들러 등 React 컴포넌트 외부 어디서나 작동합니다.

참고: [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)

### 7.5 스토리지 API 호출 캐시

**영향: 낮음-중간 (비용이 많이 드는 I/O 감소)**

`localStorage`, `sessionStorage`, `document.cookie`는 동기적이고 비용이 많이 듭니다. 메모리에 읽기를 캐시합니다.

**잘못된 예: 매 호출마다 스토리지 읽기**

```typescript
function getTheme() {
  return localStorage.getItem("theme") ?? "light";
}
// 10번 호출 = 10번 스토리지 읽기
```

**올바른 예: Map 캐시**

```typescript
const storageCache = new Map<string, string | null>();

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    storageCache.set(key, localStorage.getItem(key));
  }
  return storageCache.get(key);
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
  storageCache.set(key, value); // 캐시 동기화 유지
}
```

Map(훅이 아님)을 사용하여 유틸리티, 이벤트 핸들러 등 React 컴포넌트 외부 어디서나 작동합니다.

**쿠키 캐싱:**

```typescript
let cookieCache: Record<string, string> | null = null;

function getCookie(name: string) {
  if (!cookieCache) {
    cookieCache = Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")));
  }
  return cookieCache[name];
}
```

**중요: 외부 변경 시 무효화**

```typescript
window.addEventListener("storage", (e) => {
  if (e.key) storageCache.delete(e.key);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    storageCache.clear();
  }
});
```

스토리지가 외부적으로 변경될 수 있는 경우 (다른 탭, 서버 설정 쿠키), 캐시를 무효화합니다:

### 7.6 여러 배열 순회 결합

**영향: 낮음-중간 (순회 감소)**

여러 `.filter()` 또는 `.map()` 호출은 배열을 여러 번 순회합니다. 하나의 루프로 결합합니다.

**잘못된 예: 3번 순회**

```typescript
const admins = users.filter((u) => u.isAdmin);
const testers = users.filter((u) => u.isTester);
const inactive = users.filter((u) => !u.isActive);
```

**올바른 예: 1번 순회**

```typescript
const admins: User[] = [];
const testers: User[] = [];
const inactive: User[] = [];

for (const user of users) {
  if (user.isAdmin) admins.push(user);
  if (user.isTester) testers.push(user);
  if (!user.isActive) inactive.push(user);
}
```

### 7.7 배열 비교 시 길이 먼저 확인

**영향: 중간-높음 (길이가 다를 때 비용 많은 연산 방지)**

비용이 많이 드는 연산(정렬, 깊은 동등성, 직렬화)으로 배열을 비교할 때 먼저 길이를 확인합니다. 길이가 다르면 배열은 같을 수 없습니다.

실제 애플리케이션에서 이 최적화는 비교가 핫 패스(이벤트 핸들러, 렌더 루프)에서 실행될 때 특히 유용합니다.

**잘못된 예: 항상 비용 많은 비교 실행**

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

### 7.8 함수에서 조기 반환

**영향: 낮음-중간 (불필요한 계산 방지)**

결과가 결정되면 조기에 반환하여 불필요한 처리를 건너뜁니다.

**잘못된 예: 답을 찾은 후에도 모든 항목 처리**

```typescript
function validateUsers(users: User[]) {
  let hasError = false;
  let errorMessage = "";

  for (const user of users) {
    if (!user.email) {
      hasError = true;
      errorMessage = "Email required";
    }
    if (!user.name) {
      hasError = true;
      errorMessage = "Name required";
    }
    // 오류를 찾은 후에도 모든 사용자 계속 확인
  }

  return hasError ? { valid: false, error: errorMessage } : { valid: true };
}
```

**올바른 예: 첫 오류에서 즉시 반환**

```typescript
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) {
      return { valid: false, error: "Email required" };
    }
    if (!user.name) {
      return { valid: false, error: "Name required" };
    }
  }

  return { valid: true };
}
```

### 7.9 RegExp 생성 호이스팅

**영향: 낮음-중간 (재생성 방지)**

렌더 내부에서 RegExp를 생성하지 마세요. 모듈 스코프로 호이스팅하거나 `useMemo()`로 메모이제이션합니다.

**잘못된 예: 매 렌더마다 새 RegExp**

```tsx
function Highlighter({ text, query }: Props) {
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**올바른 예: 메모이제이션 또는 호이스팅**

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(`(${escapeRegex(query)})`, 'gi'),
    [query]
  )
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**경고: 글로벌 regex는 가변 상태를 가짐**

```typescript
const regex = /foo/g;
regex.test("foo"); // true, lastIndex = 3
regex.test("foo"); // false, lastIndex = 0
```

글로벌 regex (`/g`)는 가변 `lastIndex` 상태를 가집니다:

### 7.10 정렬 대신 루프로 최소/최대 찾기

**영향: 낮음 (O(n log n) 대신 O(n))**

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

**대안: 작은 배열에서 Math.min/Math.max**

```typescript
const numbers = [5, 2, 8, 1, 9];
const min = Math.min(...numbers);
const max = Math.max(...numbers);
```

작은 배열에서는 작동하지만 spread 연산자 제한으로 인해 매우 큰 배열에서는 더 느릴 수 있습니다. 신뢰성을 위해 루프 접근 방식을 사용하세요.

### 7.11 O(1) 조회를 위한 Set/Map 사용

**영향: 낮음-중간 (O(n)에서 O(1)로)**

반복되는 멤버십 확인을 위해 배열을 Set/Map으로 변환합니다.

**잘못된 예 (확인당 O(n)):**

```typescript
const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))
```

**올바른 예 (확인당 O(1)):**

```typescript
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```

### 7.12 불변성을 위해 sort() 대신 toSorted() 사용

**영향: 중간-높음 (React 상태의 변형 버그 방지)**

`.sort()`는 배열을 제자리에서 변형하여 React 상태와 props에서 버그를 유발할 수 있습니다. 변형 없이 새로 정렬된 배열을 생성하려면 `.toSorted()`를 사용하세요.

**잘못된 예: 원본 배열 변형**

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

**올바른 예: 새 배열 생성**

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

**브라우저 지원: 구형 브라우저 폴백**

```typescript
// 구형 브라우저 폴백
const sorted = [...items].sort((a, b) => a.value - b.value);
```

`.toSorted()`는 모든 최신 브라우저에서 사용 가능 (Chrome 110+, Safari 16+, Firefox 115+, Node.js 20+). 구형 환경에서는 spread 연산자 사용:

**다른 불변 배열 메서드:**

- `.toSorted()` - 불변 정렬

- `.toReversed()` - 불변 역순

- `.toSpliced()` - 불변 splice

- `.with()` - 불변 요소 교체

---

## 8. 고급 패턴

**영향: 낮음**

신중한 구현이 필요한 특정 경우를 위한 고급 패턴.

### 8.1 이벤트 핸들러를 Ref에 저장

**영향: 낮음 (안정적인 구독)**

콜백 변경 시 재구독하지 않아야 하는 이펙트에서 사용될 때 콜백을 ref에 저장합니다.

**잘못된 예: 매 렌더마다 재구독**

```tsx
function useWindowEvent(event: string, handler: () => void) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler]);
}
```

**올바른 예: 안정적인 구독**

```tsx
import { useEffectEvent } from "react";

function useWindowEvent(event: string, handler: () => void) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    window.addEventListener(event, onEvent);
    return () => window.removeEventListener(event, onEvent);
  }, [event]);
}
```

**대안: 최신 React를 사용 중이라면 `useEffectEvent` 사용:**

`useEffectEvent`는 동일한 패턴을 위한 더 깔끔한 API를 제공합니다: 항상 최신 버전의 핸들러를 호출하는 안정적인 함수 참조를 생성합니다.

### 8.2 안정적인 콜백 Ref를 위한 useLatest

**영향: 낮음 (이펙트 재실행 방지)**

의존성 배열에 추가하지 않고 콜백에서 최신 값에 접근합니다. 스테일 클로저를 피하면서 이펙트 재실행을 방지합니다.

**구현:**

```typescript
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
```

**잘못된 예: 매 콜백 변경마다 이펙트 재실행**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timeout);
  }, [query, onSearch]);
}
```

**올바른 예: 안정적인 이펙트, 최신 콜백**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const onSearchRef = useLatest(onSearch);

  useEffect(() => {
    const timeout = setTimeout(() => onSearchRef.current(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);
}
```

---

## 참고 자료

1. [https://react.dev](https://react.dev)
2. [https://nextjs.org](https://nextjs.org)
3. [https://swr.vercel.app](https://swr.vercel.app)
4. [https://github.com/shuding/better-all](https://github.com/shuding/better-all)
5. [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)
6. [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
7. [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
