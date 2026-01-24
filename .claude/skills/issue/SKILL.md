---
name: issue
description: GitHub Issue 생성 및 관리 가이드라인. 새로운 기능, 버그 수정, 문서화 작업의 티켓을 생성할 때 사용. Issue 기반 워크플로우를 통해 작업을 추적하고 PR과 연결.
---

# GitHub Issue 관리 가이드

GitHub Issue를 통한 체계적인 작업 관리 및 추적을 위한 가이드라인.

## Issue 유형

| 유형     | 라벨            | 설명                       | 브랜치 접두사 |
| -------- | --------------- | -------------------------- | ------------- |
| 기능     | `enhancement`   | 새로운 기능 추가           | `feat/`       |
| 버그     | `bug`           | 버그 수정                  | `fix/`        |
| 문서     | `documentation` | 문서화 작업                | `docs/`       |
| 리팩토링 | `refactor`      | 코드 개선 (기능 변경 없음) | `refactor/`   |
| 테스트   | `test`          | 테스트 추가/수정           | `test/`       |
| 설정     | `chore`         | 설정, 의존성 관리          | `chore/`      |

## Issue 제목 규칙

```
[유형] 간결한 설명 (한글)
```

**예시:**

- `[feat] 수입/지출 구분 기능 추가`
- `[fix] 로그인 실패 시 에러 메시지 미표시 수정`
- `[docs] Git 브랜치 전략 문서 추가`
- `[refactor] 코딩 컨벤션 전면 적용`

## Issue 본문 템플릿

### 기능 추가 (Enhancement)

```markdown
## 개요

[기능에 대한 간단한 설명]

## 배경

[왜 이 기능이 필요한지]

## 상세 요구사항

- [ ] 요구사항 1
- [ ] 요구사항 2
- [ ] 요구사항 3

## 기술적 고려사항

[구현 시 고려할 기술적 사항]

## 완료 조건

- [ ] 기능 구현 완료
- [ ] 테스트 통과
- [ ] 코드 리뷰 완료
```

### 버그 수정 (Bug)

```markdown
## 버그 설명

[버그에 대한 간단한 설명]

## 재현 단계

1. [단계 1]
2. [단계 2]
3. [단계 3]

## 예상 동작

[정상적으로 동작해야 하는 방식]

## 실제 동작

[현재 잘못된 동작]

## 환경

- OS:
- 브라우저:
- 버전:

## 스크린샷

[해당되는 경우]
```

### 문서화 (Documentation)

```markdown
## 개요

[문서화 작업에 대한 설명]

## 대상 문서

- [ ] 문서 1
- [ ] 문서 2

## 포함 내용

- [내용 1]
- [내용 2]

## 완료 조건

- [ ] 문서 작성 완료
- [ ] 리뷰 완료
```

### 리팩토링 (Refactor)

```markdown
## 개요

[리팩토링 대상 및 목적]

## 현재 문제점

[기존 코드의 문제점]

## 개선 방향

[어떻게 개선할 것인지]

## 영향 범위

- [파일/모듈 1]
- [파일/모듈 2]

## 완료 조건

- [ ] 리팩토링 완료
- [ ] 기존 기능 정상 동작 확인
- [ ] 테스트 통과
- [ ] 빌드 성공
```

## Issue와 PR 연결

### PR에서 Issue 자동 종료

PR 본문에 다음 키워드 사용:

```markdown
Closes #123
Fixes #123
Resolves #123
```

### 브랜치 네이밍

```
<type>/<issue-number>-<short-description>
```

**예시:**

- `feat/42-add-income-expense-type`
- `fix/15-login-error-message`
- `docs/28-git-branch-strategy`

## 라벨 사용

| 라벨             | 색상   | 용도          |
| ---------------- | ------ | ------------- |
| `enhancement`    | 녹색   | 새 기능       |
| `bug`            | 빨간색 | 버그          |
| `documentation`  | 파란색 | 문서          |
| `refactor`       | 보라색 | 리팩토링      |
| `priority: high` | 주황색 | 높은 우선순위 |
| `priority: low`  | 회색   | 낮은 우선순위 |
| `in progress`    | 노란색 | 작업 중       |
| `needs review`   | 청록색 | 리뷰 필요     |

## 워크플로우

```
1. Issue 생성 → 라벨 지정
2. 브랜치 생성 (Issue 번호 포함)
3. 작업 수행
4. PR 생성 (Issue 연결)
5. 리뷰 및 머지
6. Issue 자동 종료
```

## CLI 명령어

### Issue 생성

```bash
gh issue create --title "[feat] 기능 설명" --body "본문" --label "enhancement"
```

### Issue 목록 확인

```bash
gh issue list
gh issue list --label "bug"
```

### Issue 상세 보기

```bash
gh issue view <issue-number>
```

### Issue 종료

```bash
gh issue close <issue-number>
```
