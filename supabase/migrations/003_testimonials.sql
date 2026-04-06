-- ============================================
-- Testimonials System
-- ============================================

-- 1. Curated testimonials (managed by admin)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Client-submitted testimonials (for review)
CREATE TABLE IF NOT EXISTS testimonial_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_submissions ENABLE ROW LEVEL SECURITY;

-- Testimonials: public can read published, authenticated full access
CREATE POLICY "Public can read published testimonials"
  ON testimonials FOR SELECT TO anon USING (published = true);
CREATE POLICY "Authenticated full access to testimonials"
  ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Submissions: public can insert, authenticated full access
CREATE POLICY "Anyone can submit testimonials"
  ON testimonial_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated full access to testimonial submissions"
  ON testimonial_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Updated_at trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
