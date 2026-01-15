module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 타입 정의 (한글 설명용)
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 수정
        "style", // 코드 포맷팅 (기능 변경 없음)
        "refactor", // 리팩토링
        "perf", // 성능 개선
        "test", // 테스트 코드
        "chore", // 빌드, 설정 변경
        "revert", // 커밋 되돌리기
        "ci", // CI 설정 변경
        "build", // 빌드 시스템 변경
      ],
    ],
    // 타입은 소문자
    "type-case": [2, "always", "lower-case"],
    // 타입은 비어있으면 안됨
    "type-empty": [2, "never"],
    // 제목은 비어있으면 안됨
    "subject-empty": [2, "never"],
    // 제목 끝에 마침표 금지
    "subject-full-stop": [2, "never", "."],
    // 제목 대소문자 규칙 비활성화 (한글 사용을 위해)
    "subject-case": [0],
    // 본문 앞에 빈 줄
    "body-leading-blank": [2, "always"],
    // 푸터 앞에 빈 줄
    "footer-leading-blank": [2, "always"],
    // 헤더 최대 길이
    "header-max-length": [2, "always", 100],
  },
};
