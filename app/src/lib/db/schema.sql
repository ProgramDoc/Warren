-- Warren Financial Dashboard — PostgreSQL Schema (Render)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'household')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  details TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial data tables

CREATE TABLE IF NOT EXISTS income_entries (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,          -- 'ucla', 'aitheia', 'sl_w2', 'tampa_rent', 'rochester_rent', 'moonlighting'
  period TEXT NOT NULL,          -- '2026-01', '2026-02', etc.
  gross_amount NUMERIC(12,2) NOT NULL,
  net_amount NUMERIC(12,2),
  tax_withheld NUMERIC(12,2),
  details JSONB,                 -- Flexible storage for line items
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,        -- Chart of Accounts code (P-HOU, B-SOF, etc.)
  payment_method TEXT,           -- 'amex', 'chase_sapphire', 'checking', etc.
  personal_or_business TEXT CHECK(personal_or_business IN ('personal', 'business')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_bills (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('monthly', 'quarterly', 'annual', 'biweekly')),
  category TEXT NOT NULL,
  due_day INTEGER,               -- Day of month (1-31)
  auto_pay BOOLEAN DEFAULT FALSE,
  personal_or_business TEXT CHECK(personal_or_business IN ('personal', 'business', 'investment')),
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_deadlines (
  id SERIAL PRIMARY KEY,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  tax_type TEXT NOT NULL,        -- 'federal_estimated', 'ca_estimated', 'llc_fee', 'filing'
  amount NUMERIC(12,2),
  status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'paid', 'not_paid', 'extension', 'na')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_categories (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,     -- 'P-HOU', 'B-SOF', etc.
  name TEXT NOT NULL,
  monthly_budget NUMERIC(12,2),
  personal_or_business TEXT CHECK(personal_or_business IN ('personal', 'business')),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL CHECK(level IN ('urgent', 'warning', 'info')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_income_period ON income_entries(period);
CREATE INDEX IF NOT EXISTS idx_income_source ON income_entries(source);
