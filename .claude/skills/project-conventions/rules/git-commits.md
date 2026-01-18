---
title: Git 커밋 및 브랜치 컨벤션
category: git
---

## Git 브랜치 전략

### 핵심 원칙

**main 브랜치에 직접 push/merge 금지** - 항상 feature 브랜치에서 PR을 통해 병합

### 브랜치 네이밍

```
<type>/<설명>
```

| 타입       | 용도             | 예시                       |
| ---------- | ---------------- | -------------------------- |
| `feat`     | 새로운 기능 개발 | `feat/receipt-ocr`         |
| `fix`      | 버그 수정        | `fix/login-error`          |
| `refactor` | 리팩토링         | `refactor/auth-logic`      |
| `docs`     | 문서 작업        | `docs/readme-update`       |
| `chore`    | 설정/빌드 관련   | `chore/eslint-config`      |
| `hotfix`   | 긴급 수정        | `hotfix/critical-auth-bug` |

### 브랜치 워크플로우

```bash
# 1. main에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feat/new-feature

# 2. 작업 후 커밋
git add .
git commit -m "feat: 새 기능 구현"

# 3. 원격에 push
git push -u origin feat/new-feature

# 4. GitHub에서 PR 생성 (main <- feat/new-feature)

# 5. 리뷰 후 PR merge (Squash and merge 권장)

# 6. 로컬 정리
git checkout main
git pull origin main
git branch -d feat/new-feature
```

---

## Pull Request 규칙

### PR 제목 형식

커밋 메시지와 동일한 Conventional Commits 형식 사용

```
<type>: <제목>
```

예시:

- `feat: 월별 지출 통계 차트 추가`
- `fix: 로그인 실패 시 에러 표시 오류 수정`

### PR 본문 템플릿

```markdown
## 변경 사항

## <!-- 이 PR에서 변경된 내용 요약 -->

## 변경 이유

<!-- 왜 이 변경이 필요한지 설명 -->

## 테스트

<!-- 테스트 방법 또는 체크리스트 -->

- [ ] 로컬에서 테스트 완료
- [ ] 빌드 성공 확인

## 스크린샷 (선택)

<!-- UI 변경이 있는 경우 -->

## 관련 이슈

<!-- Closes #123 -->
```

### PR 규칙

- 하나의 PR은 하나의 목적만 가짐
- 가능한 작은 단위로 분리
- 자체 리뷰 후 PR 생성
- merge 전 빌드 성공 확인

---

## Git 커밋 컨벤션

### 커밋 메시지 형식

Conventional Commits + 한글 사용

```
<type>: <제목>

[본문 (선택)]

[푸터 (선택)]
```

### 커밋 타입

| 타입       | 설명        | 예시                                      |
| ---------- | ----------- | ----------------------------------------- |
| `feat`     | 새로운 기능 | `feat: 영수증 OCR 분석 기능 추가`         |
| `fix`      | 버그 수정   | `fix: 로그인 실패 시 에러 표시 오류 수정` |
| `docs`     | 문서 수정   | `docs: README에 설치 방법 추가`           |
| `style`    | 코드 포맷팅 | `style: Prettier 적용`                    |
| `refactor` | 리팩토링    | `refactor: 사용자 인증 로직 개선`         |
| `perf`     | 성능 개선   | `perf: 이미지 로딩 최적화`                |
| `test`     | 테스트      | `test: 로그인 기능 단위 테스트 추가`      |
| `chore`    | 빌드/설정   | `chore: ESLint 규칙 업데이트`             |
| `ci`       | CI 설정     | `ci: GitHub Actions 워크플로우 추가`      |

### 좋은 커밋 메시지 예시

```bash
# 새 기능
feat: 월별 지출 통계 차트 추가

- Recharts 라이브러리 사용
- 카테고리별 파이 차트 구현
- 일별 추이 라인 차트 구현

# 버그 수정
fix: 날짜 선택 시 시간대 오류 수정

UTC와 KST 변환 로직 추가

Closes #123

# 리팩토링
refactor: 지출 목록 컴포넌트 분리

- ExpenseItem 컴포넌트 추출
- 공통 스타일 정리
```

### 규칙

- 제목은 100자 이내
- 제목 끝에 마침표 금지
- 제목은 명령문으로 작성
- 본문은 Why 위주로 작성
- 이슈 참조 시 푸터에 `Closes #123` 형식
