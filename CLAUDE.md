# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI 기반 가계부 웹앱. 영수증 사진을 촬영하면 GPT-4 Vision이 OCR 및 카테고리 자동 분류를 수행. Supabase를 사용한 인증 및 데이터 저장.

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Start production server

# Capacitor (iOS/Android)
npm run ios      # Build + sync + open Xcode
npm run android  # Build + sync + open Android Studio
npm run cap:sync # Sync web assets to native projects
```

## Architecture

**Stack**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Supabase + OpenAI

**Key Directories**:

- `src/app/` - Next.js App Router pages and API routes
  - `(auth)/` - 인증 관련 페이지 (login)
  - `(main)/` - 인증된 사용자용 페이지 (홈, 지출추가)
  - `api/ai/` - AI 관련 API routes (영수증 OCR)
  - `auth/callback/` - OAuth callback handler
- `src/components/` - React 컴포넌트
  - `ui/` - shadcn/ui 기본 컴포넌트
  - `expense/` - 지출 관련 컴포넌트
  - `layout/` - 레이아웃 컴포넌트
- `src/lib/supabase/` - Supabase 클라이언트 (client, server, middleware)
- `src/types/` - TypeScript 타입 정의
- `supabase/schema.sql` - DB 스키마 (Supabase SQL Editor에서 실행)

**Path Alias**: `@/*` maps to `src/*`

## Supabase Setup

1. Supabase 프로젝트 생성 후 `.env.local` 설정:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key
```

2. Authentication > Providers에서 Google OAuth 설정
3. SQL Editor에서 `supabase/schema.sql` 실행

## Data Model

- **categories**: 지출 카테고리 (기본 8개 + 사용자/AI 생성)
- **expenses**: 지출 내역 (user_id, category_id, name, amount, date)

RLS 정책으로 사용자별 데이터 격리.

## AI Integration

`/api/ai/analyze-receipt` - GPT-4 Vision을 사용한 영수증 분석

- 이미지에서 상호명, 금액, 날짜 추출
- 기존 카테고리 매칭 또는 새 카테고리 제안
- 응답: `{ name, amount, date, category, isNewCategory, suggestedIcon?, suggestedColor? }`

## Mobile (Capacitor)

iOS/Android 네이티브 앱 빌드를 위한 Capacitor 설정:

- `capacitor.config.ts` - 앱 ID, 이름, webDir 설정
- `ios/` - Xcode 프로젝트 (Pod install 필요)
- `android/` - Android Studio 프로젝트

**주의**: Next.js는 서버 기능(API Routes, middleware)이 있으므로 Vercel 배포 후 WebView로 로드하는 방식 권장.
