# AI 가계부

영수증을 찍으면 AI가 자동으로 가계부를 작성해주는 웹앱입니다.

## 주요 기능

- 📸 **영수증 OCR**: 영수증 사진을 촬영하면 GPT-4 Vision이 자동으로 금액, 항목명, 날짜를 추출
- 🏷️ **AI 카테고리 분류**: 지출 항목에 맞는 카테고리를 AI가 자동 선택
- ✨ **카테고리 자동 생성**: 기존 카테고리에 없으면 AI가 새로운 카테고리를 생성
- 📊 **지출 통계**: 카테고리별 지출 현황을 차트로 시각화
- 🔐 **소셜 로그인**: Google OAuth 지원

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (OAuth)
- **AI**: OpenAI GPT-4 Vision

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local.example`을 `.env.local`로 복사 후 값 입력:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Authentication > Providers에서 Google 설정
3. SQL Editor에서 `supabase/schema.sql` 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (main)/            # 메인 앱 페이지
│   ├── api/               # API Routes
│   └── auth/callback/     # OAuth callback
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── expense/           # 지출 관련 컴포넌트
│   └── layout/            # 레이아웃 컴포넌트
├── lib/
│   └── supabase/          # Supabase 클라이언트
└── types/                 # TypeScript 타입
```

## 배포

Vercel에 배포:

```bash
npm run build
```

환경변수를 Vercel 프로젝트 설정에 추가 후 배포.
