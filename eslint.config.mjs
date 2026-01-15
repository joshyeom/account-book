import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier 통합
      "prettier/prettier": "warn",

      // React Hooks - 엄격하게 적용
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // console.log - 경고만
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // 네이밍 컨벤션 - camelCase
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
        },
      ],

      // TypeScript 규칙 - 부드러움
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      // type 우선 사용 권장 (interface 대신)
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],

      // 함수 스타일 - 화살표 함수 우선
      "prefer-arrow-callback": "warn",
      "arrow-body-style": ["warn", "as-needed"],

      // Import 규칙
      "import/order": "off", // Prettier plugin이 처리
      "import/no-duplicates": "error",

      // React 규칙
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "warn",
      "react/no-unescaped-entities": "warn",
      "react/jsx-no-target-blank": "error",
      // Named export 권장
      "import/no-default-export": "off", // Next.js 페이지는 default export 필요

      // 일반 규칙 - 부드러움
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-var": "error",
      "prefer-const": "warn",
      "eqeqeq": ["warn", "always", { null: "ignore" }],
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "warn",
      // 매직 넘버 경고 (상수 추출 권장)
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
    },
  },
  // Next.js 페이지/레이아웃은 default export 허용
  {
    files: ["**/app/**/page.tsx", "**/app/**/layout.tsx", "**/app/**/loading.tsx", "**/app/**/error.tsx", "**/app/**/not-found.tsx"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // Override default ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "ios/**",
    "android/**",
    ".capacitor/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
