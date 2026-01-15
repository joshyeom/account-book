---
name: vercel-react-best-practices
description: Vercel 엔지니어링 팀의 React 및 Next.js 성능 최적화 가이드라인. React/Next.js 코드를 작성, 리뷰, 리팩토링할 때 최적의 성능 패턴을 보장하기 위해 사용. React 컴포넌트, Next.js 페이지, 데이터 페칭, 번들 최적화, 성능 개선 작업 시 트리거됨.
---

# Vercel React 베스트 프랙티스

Vercel이 관리하는 React 및 Next.js 애플리케이션을 위한 종합 성능 최적화 가이드. 8개 카테고리에 걸쳐 45개의 규칙이 있으며, 자동화된 리팩토링과 코드 생성을 위해 영향도별로 우선순위가 지정되어 있음.

## 적용 시점

다음 상황에서 이 가이드라인을 참조:

- 새로운 React 컴포넌트 또는 Next.js 페이지 작성 시
- 데이터 페칭 구현 시 (클라이언트 또는 서버 사이드)
- 성능 이슈를 위한 코드 리뷰 시
- 기존 React/Next.js 코드 리팩토링 시
- 번들 크기 또는 로드 시간 최적화 시

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리                      | 영향도    | 접두사       |
| -------- | ----------------------------- | --------- | ------------ |
| 1        | 워터폴 제거                   | 매우 높음 | `async-`     |
| 2        | 번들 크기 최적화              | 매우 높음 | `bundle-`    |
| 3        | 서버 사이드 성능              | 높음      | `server-`    |
| 4        | 클라이언트 사이드 데이터 페칭 | 중상      | `client-`    |
| 5        | 리렌더 최적화                 | 중간      | `rerender-`  |
| 6        | 렌더링 성능                   | 중간      | `rendering-` |
| 7        | JavaScript 성능               | 중하      | `js-`        |
| 8        | 고급 패턴                     | 낮음      | `advanced-`  |

## 빠른 참조

### 1. 워터폴 제거 (매우 높음)

- `async-defer-await` - await를 실제로 사용되는 분기로 이동
- `async-parallel` - 독립적인 작업에 Promise.all() 사용
- `async-dependencies` - 부분적 의존성에 better-all 사용
- `async-api-routes` - API 라우트에서 프로미스를 먼저 시작하고 나중에 await
- `async-suspense-boundaries` - Suspense를 사용하여 콘텐츠 스트리밍

### 2. 번들 크기 최적화 (매우 높음)

- `bundle-barrel-imports` - barrel 파일 대신 직접 import
- `bundle-dynamic-imports` - 무거운 컴포넌트에 next/dynamic 사용
- `bundle-defer-third-party` - 하이드레이션 후 분석/로깅 로드
- `bundle-conditional` - 기능 활성화 시에만 모듈 로드
- `bundle-preload` - 호버/포커스 시 미리 로드하여 체감 속도 향상

### 3. 서버 사이드 성능 (높음)

- `server-cache-react` - 요청별 중복 제거에 React.cache() 사용
- `server-cache-lru` - 요청 간 캐싱에 LRU 캐시 사용
- `server-serialization` - 클라이언트 컴포넌트에 전달하는 데이터 최소화
- `server-parallel-fetching` - 페칭을 병렬화하도록 컴포넌트 구조 변경
- `server-after-nonblocking` - 논블로킹 작업에 after() 사용

### 4. 클라이언트 사이드 데이터 페칭 (중상)

- `client-swr-dedup` - 자동 요청 중복 제거에 SWR 사용
- `client-event-listeners` - 전역 이벤트 리스너 중복 제거

### 5. 리렌더 최적화 (중간)

- `rerender-defer-reads` - 콜백에서만 사용되는 상태 구독 금지
- `rerender-memo` - 비용이 큰 작업을 메모이제이션된 컴포넌트로 추출
- `rerender-dependencies` - effect에서 원시 타입 의존성 사용
- `rerender-derived-state` - 원시 값 대신 파생된 boolean 구독
- `rerender-functional-setstate` - 안정적인 콜백을 위해 함수형 setState 사용
- `rerender-lazy-state-init` - 비용이 큰 값에 useState에 함수 전달
- `rerender-transitions` - 긴급하지 않은 업데이트에 startTransition 사용

### 6. 렌더링 성능 (중간)

- `rendering-animate-svg-wrapper` - SVG 요소 대신 div 래퍼 애니메이션
- `rendering-content-visibility` - 긴 목록에 content-visibility 사용
- `rendering-hoist-jsx` - 정적 JSX를 컴포넌트 외부로 추출
- `rendering-svg-precision` - SVG 좌표 정밀도 감소
- `rendering-hydration-no-flicker` - 클라이언트 전용 데이터에 인라인 스크립트 사용
- `rendering-activity` - 보이기/숨기기에 Activity 컴포넌트 사용
- `rendering-conditional-render` - 조건부 렌더링에 && 대신 삼항 연산자 사용

### 7. JavaScript 성능 (중하)

- `js-batch-dom-css` - 클래스나 cssText를 통해 CSS 변경 그룹화
- `js-index-maps` - 반복 조회를 위해 Map 구축
- `js-cache-property-access` - 루프에서 객체 속성 캐시
- `js-cache-function-results` - 모듈 레벨 Map에 함수 결과 캐시
- `js-cache-storage` - localStorage/sessionStorage 읽기 캐시
- `js-combine-iterations` - 여러 filter/map을 하나의 루프로 결합
- `js-length-check-first` - 비용이 큰 비교 전에 배열 길이 먼저 확인
- `js-early-exit` - 함수에서 조기 반환
- `js-hoist-regexp` - RegExp 생성을 루프 외부로 이동
- `js-min-max-loop` - sort 대신 루프로 min/max 계산
- `js-set-map-lookups` - O(1) 조회를 위해 Set/Map 사용
- `js-tosorted-immutable` - 불변성을 위해 toSorted() 사용

### 8. 고급 패턴 (낮음)

- `advanced-event-handler-refs` - 이벤트 핸들러를 refs에 저장
- `advanced-use-latest` - 안정적인 콜백 refs를 위해 useLatest 사용

## 사용 방법

상세한 설명과 코드 예제는 개별 규칙 파일 참조:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
rules/_sections.md
```

각 규칙 파일에 포함된 내용:

- 왜 중요한지에 대한 간략한 설명
- 잘못된 코드 예제와 설명
- 올바른 코드 예제와 설명
- 추가 컨텍스트 및 참조

## 전체 컴파일된 문서

모든 규칙이 확장된 전체 가이드: `AGENTS.md`
