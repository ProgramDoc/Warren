-- Warren Dashboard — Seed Data from Financial Intake (April 12, 2026)
-- Run after schema init to populate initial data

-- Tax deadlines
INSERT INTO tax_deadlines (deadline, description, tax_type, amount, status) VALUES
  ('2026-04-15', 'Q1 2026 Federal Estimated Tax', 'federal_estimated', NULL, 'not_paid'),
  ('2026-04-15', 'Q1 2026 CA Estimated Tax', 'ca_estimated', NULL, 'not_paid'),
  ('2026-04-15', 'CA LLC Fee (AiTheia)', 'llc_fee', 800, 'upcoming'),
  ('2026-06-15', 'Q2 2026 Federal Estimated Tax', 'federal_estimated', NULL, 'upcoming'),
  ('2026-06-15', 'Q2 2026 CA Estimated Tax', 'ca_estimated', NULL, 'upcoming'),
  ('2026-09-15', 'Q3 2026 Federal Estimated Tax', 'federal_estimated', NULL, 'upcoming'),
  ('2026-09-15', 'Q3 2026 CA Estimated Tax', 'ca_estimated', NULL, 'upcoming'),
  ('2026-10-15', '2025 Tax Return (extended)', 'filing', NULL, 'extension'),
  ('2027-01-15', 'Q4 2026 Federal Estimated Tax', 'federal_estimated', NULL, 'upcoming'),
  ('2027-01-15', 'Q4 2026 CA Estimated Tax', 'ca_estimated', NULL, 'upcoming')
ON CONFLICT DO NOTHING;

-- Recurring bills
INSERT INTO recurring_bills (description, amount, frequency, category, due_day, auto_pay, personal_or_business) VALUES
  ('LA Rent', 5995.00, 'monthly', 'P-HOU', 1, false, 'personal'),
  ('Rochester Mortgage', 3335.17, 'monthly', 'P-HOU', 1, true, 'investment'),
  ('Tampa HOA', 579.71, 'monthly', 'P-HOU', 1, true, 'investment'),
  ('Student Loans (Laurel Road)', 2486.86, 'monthly', 'P-DEB', 15, true, 'personal'),
  ('BMW X7 Lease', 546.29, 'monthly', 'P-TRN', 1, true, 'personal'),
  ('VW Tiguan Lease', 719.34, 'monthly', 'P-TRN', 1, true, 'personal'),
  ('Car Insurance (Amica)', 520.00, 'monthly', 'P-TRN', 1, true, 'personal'),
  ('Bay Club El Segundo', 685.00, 'monthly', 'P-HLT', 1, true, 'personal'),
  ('Beach Babies (Evie)', 2530.00, 'monthly', 'P-CHD', 1, false, 'personal'),
  ('MB USD EDP (Noah)', 645.00, 'monthly', 'P-CHD', 1, false, 'personal'),
  ('Kumon (Noah)', 315.00, 'monthly', 'P-CHD', 1, true, 'personal'),
  ('AT&T', 200.00, 'monthly', 'P-UTL', 1, true, 'personal'),
  ('Cell Phone', 400.00, 'monthly', 'P-UTL', 1, true, 'personal'),
  ('ChatGPT / Anthropic', 200.00, 'monthly', 'B-SOF', 1, true, 'business'),
  ('Rochester Property Mgmt', 109.00, 'monthly', 'P-HOU', 1, true, 'investment'),
  ('UCLA Fitness/Rec', 127.00, 'monthly', 'P-HLT', 1, true, 'personal')
ON CONFLICT DO NOTHING;

-- Budget categories (from Chart of Accounts)
INSERT INTO budget_categories (code, name, monthly_budget, personal_or_business) VALUES
  ('P-HOU', 'Housing', 12000, 'personal'),
  ('P-UTL', 'Utilities & Telecom', 800, 'personal'),
  ('P-TRN', 'Transportation', 2000, 'personal'),
  ('P-GRC', 'Groceries', 2000, 'personal'),
  ('P-DIN', 'Dining & Entertainment', 1500, 'personal'),
  ('P-HLT', 'Health & Fitness', 1000, 'personal'),
  ('P-CHD', 'Childcare & Education', 4000, 'personal'),
  ('P-INS', 'Insurance', 300, 'personal'),
  ('P-DEB', 'Debt Payments', 2500, 'personal'),
  ('P-TRV', 'Travel', 1500, 'personal'),
  ('P-CLO', 'Clothing', 500, 'personal'),
  ('P-MSC', 'Miscellaneous', 500, 'personal'),
  ('B-HOM', 'Home Office', 200, 'business'),
  ('B-SOF', 'Software & Tools', 300, 'business'),
  ('B-TRV', 'Business Travel', 500, 'business'),
  ('B-PRO', 'Professional Development', 300, 'business'),
  ('B-MSC', 'Business Miscellaneous', 200, 'business')
ON CONFLICT (code) DO NOTHING;

-- Initial alerts
INSERT INTO alerts (level, message) VALUES
  ('urgent', 'April 15 deadline in 3 days — estimated taxes + LLC fee due. Contact CPA.'),
  ('urgent', 'No estimated tax payments made for AiTheia Q1 income ($62,125). Recommend $10-12K federal + $3-4K CA.'),
  ('warning', 'W-4 filed as Single — should review for MFJ accuracy with CPA.'),
  ('warning', 'SL paystub needed for complete withholding analysis.'),
  ('info', 'No 403(b) contributions — potential $23,500/year tax-deferred savings.'),
  ('info', 'AiTheia S-Corp election could save $5,000-$8,000 in SE tax annually. Discuss with CPA.'),
  ('info', 'Financial intake completed — weekly updates begin next week.')
ON CONFLICT DO NOTHING;

-- Income entries (YTD from paystubs)
INSERT INTO income_entries (source, period, gross_amount, net_amount, tax_withheld, details) VALUES
  ('ucla', '2026-01', 15575.00, 9366.73, 4835.69, '{"regular": 8650, "differential": 6925}'),
  ('ucla', '2026-02', 15575.00, 9366.74, 4835.68, '{"regular": 8650, "differential": 6925}'),
  ('ucla', '2026-03', 29050.58, 16256.42, 11421.58, '{"regular": 8650, "differential": 6925, "z_payment": 13475.58}'),
  ('aitheia', '2026-01', 5750.00, 5750.00, 0, '{"type": "consulting"}'),
  ('aitheia', '2026-02', 14125.00, 14125.00, 0, '{"type": "consulting"}'),
  ('aitheia', '2026-03', 42250.00, 42250.00, 0, '{"type": "consulting"}'),
  ('sl_w2', '2026-01', 27500.00, 13223.79, NULL, '{"gross_annual": 330000}'),
  ('sl_w2', '2026-02', 27500.00, 13173.19, NULL, '{"gross_annual": 330000}'),
  ('sl_w2', '2026-03', 27500.00, 13173.72, NULL, '{"gross_annual": 330000}')
ON CONFLICT DO NOTHING;
