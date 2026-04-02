-- ============================================
-- CRM Enhancements: Pipeline, Payments, Fields
-- ============================================

-- 1. Drop old status constraints
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_submissions_status_check;
ALTER TABLE project_inquiries DROP CONSTRAINT IF EXISTS project_inquiries_status_check;

-- 2. Add new 8-stage pipeline constraint
ALTER TABLE contact_submissions ADD CONSTRAINT contact_submissions_status_check
  CHECK (status IN ('new','contacted','in_discussion','proposal_sent','negotiation','won','lost','archived'));

ALTER TABLE project_inquiries ADD CONSTRAINT project_inquiries_status_check
  CHECK (status IN ('new','contacted','in_discussion','proposal_sent','negotiation','won','lost','archived'));

-- 3. Migrate existing data to new statuses
UPDATE contact_submissions SET status = 'contacted' WHERE status = 'read';
UPDATE contact_submissions SET status = 'contacted' WHERE status = 'replied';
UPDATE project_inquiries SET status = 'in_discussion' WHERE status = 'in_progress';
UPDATE project_inquiries SET status = 'won' WHERE status = 'completed';

-- 4. New columns on contact_submissions
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS project_value TEXT;

ALTER TABLE contact_submissions ADD CONSTRAINT contact_submissions_priority_check
  CHECK (priority IN ('low','medium','high','urgent'));

-- 5. New columns on project_inquiries
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS project_value TEXT;

ALTER TABLE project_inquiries ADD CONSTRAINT project_inquiries_priority_check
  CHECK (priority IN ('low','medium','high','urgent'));

-- 6. Drop old requirement constraint on project_inquiries (allow free text)
ALTER TABLE project_inquiries DROP CONSTRAINT IF EXISTS project_inquiries_requirement_check;

-- 7. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('submission', 'inquiry')),
  entity_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
  payment_date DATE,
  due_date DATE,
  method TEXT CHECK (method IN ('bank_transfer', 'upi', 'paypal', 'stripe', 'other')),
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('submission', 'inquiry')),
  entity_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. RLS for new tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access to payments"
  ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to status_history"
  ON status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Delete policies (missing from original schema)
CREATE POLICY "Authenticated can delete submissions"
  ON contact_submissions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete inquiries"
  ON project_inquiries FOR DELETE TO authenticated USING (true);

-- 11. Updated_at trigger for payments
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
