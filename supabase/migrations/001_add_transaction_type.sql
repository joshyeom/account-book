-- 수입/지출 구분을 위한 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- 1. expenses 테이블에 type 컬럼 추가
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense'
CHECK (type IN ('income', 'expense'));

-- 2. 수입용 기본 카테고리 추가
INSERT INTO categories (name, icon, color, is_default) VALUES
  ('월급', 'Banknote', 'hsl(142, 71%, 45%)', true),
  ('용돈', 'Gift', 'hsl(280, 68%, 47%)', true),
  ('이자', 'TrendingUp', 'hsl(221, 83%, 53%)', true),
  ('기타수입', 'Plus', 'hsl(186, 94%, 37%)', true)
ON CONFLICT DO NOTHING;

-- 3. 카테고리에 type 컬럼 추가 (수입/지출 카테고리 구분)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS category_type TEXT NOT NULL DEFAULT 'expense'
CHECK (category_type IN ('income', 'expense', 'both'));

-- 4. 기존 카테고리 타입 업데이트
UPDATE categories SET category_type = 'expense' WHERE name IN ('식비', '교통', '카페', '쇼핑', '여가', '건강', '주거', '공과금');
UPDATE categories SET category_type = 'income' WHERE name IN ('월급', '용돈', '이자', '기타수입');

-- 5. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);
