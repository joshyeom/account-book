# Git 커밋 생성

staged 변경사항을 분석하고 프로젝트 컨벤션에 맞는 커밋을 생성합니다.

## 실행 단계

1. **현재 상태 확인**
   - `git status`로 staged/unstaged 변경사항 확인
   - `git diff --cached`로 staged 변경사항 상세 확인

2. **커밋 메시지 작성**
   - 프로젝트 컨벤션 준수 (`.claude/skills/project-conventions/rules/git-commits.md` 참조)
   - Conventional Commits 형식: `<type>: <제목>`
   - 타입: feat, fix, docs, style, refactor, perf, test, chore, ci
   - 제목은 한글로 작성, 100자 이내, 마침표 없음

3. **커밋 실행**
   - staged 변경사항이 없으면 사용자에게 알림
   - 커밋 메시지를 사용자에게 제안하고 확인 후 커밋

## 커밋 메시지 예시

```
feat: 영수증 OCR 분석 기능 추가
fix: 로그인 실패 시 에러 표시 오류 수정
refactor: 사용자 인증 로직 개선
docs: README에 설치 방법 추가
chore: ESLint 규칙 업데이트
```

## 주의사항

- main 브랜치에서 직접 커밋하지 않도록 경고
- 변경 내용의 "왜"에 초점을 맞춘 메시지 작성
- 여러 목적의 변경이 섞여있으면 분리 커밋 권장
