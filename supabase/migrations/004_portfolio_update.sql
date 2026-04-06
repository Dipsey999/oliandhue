-- ============================================
-- Portfolio/Work System Update
-- ============================================

-- Add new columns to portfolio_items
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS description TEXT;

-- Add category constraint
ALTER TABLE portfolio_items ADD CONSTRAINT portfolio_items_category_check
  CHECK (category IN ('product_design', 'website', 'branding', 'design_dev'));
