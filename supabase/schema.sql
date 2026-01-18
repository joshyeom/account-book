-- AI 가계부 Database Schema
-- Supabase SQL Editor에서 실행하세요

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'HelpCircle',
  color TEXT NOT NULL DEFAULT 'hsl(0, 0%, 50%)',
  is_default BOOLEAN NOT NULL DEFAULT false,
  category_type TEXT NOT NULL DEFAULT 'expense' CHECK (category_type IN ('income', 'expense', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  receipt_url TEXT,
  ai_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view default categories"
  ON categories FOR SELECT
  USING (is_default = true);

CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, icon, color, is_default, category_type) VALUES
  ('식비', 'Utensils', 'hsl(0, 84%, 60%)', true, 'expense'),
  ('교통', 'Car', 'hsl(25, 95%, 53%)', true, 'expense'),
  ('카페', 'Coffee', 'hsl(30, 41%, 41%)', true, 'expense'),
  ('쇼핑', 'ShoppingBag', 'hsl(280, 68%, 47%)', true, 'expense'),
  ('여가', 'Film', 'hsl(221, 83%, 53%)', true, 'expense'),
  ('건강', 'Heart', 'hsl(142, 71%, 45%)', true, 'expense'),
  ('주거', 'Home', 'hsl(186, 94%, 37%)', true, 'expense'),
  ('공과금', 'Zap', 'hsl(48, 96%, 53%)', true, 'expense'),
  ('급여', 'Wallet', 'hsl(142, 76%, 36%)', true, 'income'),
  ('부수입', 'TrendingUp', 'hsl(200, 98%, 39%)', true, 'income'),
  ('투자수익', 'LineChart', 'hsl(262, 83%, 58%)', true, 'income');
