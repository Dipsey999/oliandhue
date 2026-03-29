-- ============================================
-- Oli & Hue Admin Panel — Full Database Schema
-- ============================================

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contact Submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  phone TEXT,
  checkbox_newsletter BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  form_source TEXT DEFAULT 'contact',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Clients (before project_inquiries since it references clients)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Project Inquiries
CREATE TABLE project_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  requirement TEXT CHECK (requirement IN ('product_design', 'website', 'branding')),
  project_details TEXT,
  project_links TEXT,
  budget TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'archived')),
  assigned_to UUID REFERENCES profiles(id),
  client_id UUID REFERENCES clients(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer',
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- 6. Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Portfolio Items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_description TEXT,
  heading TEXT,
  brand_color TEXT,
  cover_image_url TEXT,
  intro_title TEXT,
  intro_text TEXT,
  case_images TEXT[],
  midpage_image_url TEXT,
  final_title TEXT,
  final_text TEXT,
  final_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles viewable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Contact Submissions
CREATE POLICY "Authenticated can read submissions" ON contact_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update submissions" ON contact_submissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can insert submissions" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Project Inquiries
CREATE POLICY "Authenticated can read inquiries" ON project_inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update inquiries" ON project_inquiries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can insert inquiries" ON project_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Newsletter
CREATE POLICY "Authenticated can read subscribers" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can delete subscribers" ON newsletter_subscribers FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Clients
CREATE POLICY "Authenticated full access to clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blog Posts
CREATE POLICY "Authenticated full access to blog" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT TO anon USING (published = true);

-- Portfolio
CREATE POLICY "Authenticated full access to portfolio" ON portfolio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published portfolio" ON portfolio_items FOR SELECT TO anon USING (published = true);

-- Settings
CREATE POLICY "Authenticated can read settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can modify settings" ON settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert settings" ON settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Activity Log
CREATE POLICY "Authenticated can read activity" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert activity" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed default settings
-- ============================================
INSERT INTO settings (key, value) VALUES
  ('company_info', '{"name": "Oli & Hue", "email": "hello@oliandhue.com", "phone": "", "address": ""}'::jsonb),
  ('notifications', '{"email_on_new_submission": true, "email_on_new_inquiry": true, "email_on_new_subscriber": false}'::jsonb);
