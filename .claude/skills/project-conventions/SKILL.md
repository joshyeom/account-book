---
name: project-conventions
description: AI 가계부 프로젝트의 코딩 컨벤션 가이드라인. 코드 작성, 리뷰, 리팩토링 시 일관된 스타일을 보장하기 위해 사용. 새 파일 생성, 함수 작성, 타입 정의, 커밋 작성 시 트리거됨.
---

# 프로젝트 코딩 컨벤션

AI 가계부 프로젝트의 코드 스타일 및 컨벤션 가이드. 일관성 있고 유지보수하기 쉬운 코드 작성을 위한 규칙들.

## 적용 시점

다음 상황에서 이 가이드라인을 참조:

- 새로운 컴포넌트/함수/타입 작성 시
- 코드 리뷰 시
- 리팩토링 작업 시
- Git 커밋 작성 시

## 규칙 카테고리

| 카테고리   | 설명                             | 접두사    |
| ---------- | -------------------------------- | --------- |
| 포맷팅     | 코드 스타일, 들여쓰기, 따옴표 등 | `format-` |
| TypeScript | 타입 정의, 타입 사용 규칙        | `ts-`     |
| 함수       | 함수 선언, 네이밍, 패턴          | `fn-`     |
| React      | 컴포넌트, 훅, 상태 관리          | `react-`  |
| 파일       | 파일/폴더 구조, 네이밍           | `file-`   |
| Git        | 커밋 메시지, 브랜치 규칙         | `git-`    |

## 빠른 참조

상세한 규칙은 개별 파일 참조:

- `rules/format-basic.md` - 기본 포맷팅 규칙
- `rules/ts-type-definitions.md` - TypeScript 타입 정의
- `rules/fn-declarations.md` - 함수 선언 규칙
- `rules/react-components.md` - React 컴포넌트 규칙
- `rules/file-structure.md` - 파일/폴더 구조
- `rules/git-commits.md` - Git 커밋 컨벤션

## 전체 컴파일된 문서

모든 규칙이 확장된 전체 가이드: `AGENTS.md`
