# Pull Request 생성

현재 브랜치의 변경사항을 분석하고 main 브랜치로의 PR을 생성합니다.

## 실행 단계

1. **사전 확인**
   - 현재 브랜치가 main이면 중단하고 경고
   - `git status`로 커밋되지 않은 변경사항 확인
   - 미커밋 변경사항이 있으면 먼저 커밋하도록 안내

2. **브랜치 분석**
   - `git log main..HEAD --oneline`로 main 대비 커밋 목록 확인
   - `git diff main...HEAD`로 전체 변경사항 확인
   - 변경된 파일 목록 파악

3. **원격 push**
   - 원격에 브랜치가 없으면 `git push -u origin <branch>` 실행
   - 이미 있으면 `git push` 실행

4. **PR 생성**
   - `gh pr create` 사용
   - 프로젝트 컨벤션에 맞는 제목/본문 생성
   - 제목: `<type>: <설명>` (Conventional Commits)
   - 본문: 변경 사항, 변경 이유, 테스트 체크리스트 포함

## PR 본문 템플릿

```markdown
## 변경 사항

- [변경 내용 요약]

## 변경 이유

[왜 이 변경이 필요한지]

## 테스트

- [ ] 로컬에서 테스트 완료
- [ ] 빌드 성공 확인 (`npm run build`)

## 스크린샷

[UI 변경 시 추가]

## 관련 이슈

Closes #[이슈번호]
```

## 주의사항

- main 브랜치에서 PR 생성 시도 시 즉시 중단
- 하나의 PR은 하나의 목적만 가지도록 안내
- PR 생성 전 빌드 테스트 권장
- Squash and merge 권장 안내
