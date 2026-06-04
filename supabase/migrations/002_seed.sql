-- ============================================================
-- 002_seed.sql — KPI master data + default period + sample entries
-- Run AFTER 001_schema.sql
-- ============================================================

-- ── KPI Categories ───────────────────────────────────────────
INSERT INTO kpi_categories (id, name, max_score, accent_color, sort_order) VALUES
  ('A','Human Resource & Operations',       10,'#6B1A1A',1),
  ('B','Research Excellence',               45,'#1565C0',2),
  ('C','Innovation & Commercialization',    30,'#2E7D32',3),
  ('D','Sustainability & Capacity Building',15,'#E65100',4)
ON CONFLICT (id) DO NOTHING;

-- ── Default Assessment Period ─────────────────────────────────
INSERT INTO assessment_periods (id, label, year_from, year_to, status, deadline) VALUES
  ('00000000-0000-0000-0000-000000000001','AY 2024-2025',2024,2025,'ACTIVE','2025-03-31')
ON CONFLICT (id) DO NOTHING;

-- ── KPI Indicators (all 31) ──────────────────────────────────
INSERT INTO kpi_indicators
  (code,category_id,name,description,max_score,scoring_guide,unit,evidence_required,required_docs,sort_order)
VALUES
-- Section A
('A1','A','ORIC Staffing Compliance',
  'Number of full-time ORIC staff against HEC-mandated minimum.',
  2,'Score 2 if ≥5 staff · Score 1 if 3–4 · Score 0 if <3',
  'staff',true,'["Staff appointment letters","ORIC org chart"]',1),

('A2','A','Annual ORIC Operating Budget',
  'Approved annual operating budget allocated to ORIC (millions PKR).',
  2,'Score 2 if ≥5M · Score 1 if 3–5M · Score 0 if <3M',
  'M PKR',true,'["Budget approval document","Syndicate meeting minutes"]',2),

('A3','A','Research Policies & SOPs',
  'Number of approved research governance policies and SOPs in force.',
  2,'Score 2 if ≥5 policies · Score 1 if 1–4 · Score 0 if none',
  'policies',true,'["Policy documents","Approval notifications"]',3),

('A4','A','Capacity-Building Trainings',
  'Research capacity-building workshops and seminars conducted.',
  2,'Score 2 if ≥4 sessions · Score 1 if 1–3 · Score 0 if none',
  'sessions',true,'["Training attendance sheets","Event reports"]',4),

('A5','A','Faculty Research Incentive Policy',
  'University-approved policy to incentivize faculty research output.',
  1,'Score 1 if approved incentive policy operational · Score 0 if none',
  'policies',true,'["Approved incentive policy document"]',5),

('A6','A','ORIC Annual Report Published',
  'Annual ORIC performance report published and disseminated.',
  1,'Score 1 if annual report published and publicly available · Score 0 if not',
  'reports',true,'["Published annual report"]',6),

-- Section B
('B1','B','HEC Research Proposals Submitted',
  'Research proposals submitted to HEC, divided by PhD faculty.',
  4,'Score 4 if ratio ≥1.0 · Score 3 if ≥0.5 · Score 1 if any submitted',
  'proposals',true,'["HEC submission confirmations"]',7),

('B2','B','Research Grants Secured',
  'Competitive research grants awarded during the year.',
  6,'Score 6 if ≥4 grants · Score 4 if 2–3 · Score 2 if 1',
  'grants',true,'["Grant award letters","Disbursement evidence"]',8),

('B3','B','Impact-Factor Publications',
  'JCR impact-factor journals, normalised by faculty count.',
  9,'Score 9 if ratio ≥1.0 · Score 6 if ≥0.6 · Score 3 if ≥0.3',
  'papers',true,'["Publication list with DOIs","First-page PDFs"]',9),

('B4','B','PhD Graduates Produced',
  'PhD scholars who completed their degree during the assessment year.',
  6,'Score 6 if ≥10 · Score 4 if 4–9 · Score 2 if 1–3',
  'graduates',true,'["Degree completion notifications"]',10),

('B5','B','Citations Index (3-year)',
  'Total Scopus citations to faculty work over the last three years.',
  4,'Score 4 if ≥2000 · Score 3 if ≥1000 · Score 1 if ≥400',
  'citations',true,'["Scopus citation report"]',11),

('B6','B','Post-doctoral Fellows',
  'Active post-doctoral researchers working at the university.',
  3,'Score 3 if ≥5 postdocs · Score 2 if 2–4 · Score 1 if 1',
  'postdocs',true,'["Postdoc appointment letters"]',12),

('B7','B','Research Centers & Institutes',
  'Functional research centers or institutes established.',
  4,'Score 4 if ≥3 centers · Score 2 if 2 · Score 1 if 1',
  'centers',true,'["Center establishment notifications"]',13),

('B8','B','Conference Papers & Presentations',
  'International and national conference papers presented by faculty.',
  4,'Score 4 if ≥50 papers · Score 3 if 20–49 · Score 1 if <20',
  'papers',true,'["Conference acceptance letters"]',14),

('B9','B','Books & Book Chapters',
  'Books and book chapters published by faculty.',
  3,'Score 3 if ≥10 · Score 2 if 5–9 · Score 1 if 1–4',
  'publications',true,'["Publisher confirmation letters"]',15),

('B10','B','HEC-Recognized Research Journals',
  'Research journals published by the university and recognized by HEC.',
  2,'Score 2 if ≥2 HEC-recognized journals · Score 1 if 1 · Score 0 if none',
  'journals',true,'["HEC journal recognition letters"]',16),

('B11','B','Research Management System (RMIS)',
  'Operational RMIS with active modules.',
  6,'Score 6 if RMIS fully operational (≥4 modules) · Score 3 if partial · Score 0 if none',
  'modules',true,'["RMIS screenshots","IT confirmation"]',17),

-- Section C
('C1','C','Patents Filed',
  'Patent applications filed with IPO-Pakistan or international offices.',
  5,'Score 5 if ≥5 · Score 3 if 3–4 · Score 1 if 1–2',
  'patents',true,'["Patent filing receipts","Application numbers"]',18),

('C2','C','Patents Granted',
  'Patents formally granted during the assessment year.',
  5,'Score 5 if ≥3 · Score 3 if 2 · Score 1 if 1',
  'patents',true,'["Grant certificates from IPO/USPTO"]',19),

('C3','C','Startups & Spin-offs',
  'University-affiliated startups incubated or spun off.',
  5,'Score 5 if ≥3 · Score 3 if 2 · Score 1 if 1',
  'startups',true,'["Incubation agreements","Registration certificates"]',20),

('C4','C','Technology Licensing Agreements',
  'Technology licensing agreements executed with industry.',
  4,'Score 4 if ≥3 · Score 2 if 2 · Score 1 if 1',
  'deals',true,'["Signed licensing agreements"]',21),

('C5','C','Industry-Sponsored Research Projects',
  'Research projects fully or partially funded by industry.',
  4,'Score 4 if ≥4 projects · Score 2 if 2–3 · Score 1 if 1',
  'projects',true,'["Sponsorship agreements","Project reports"]',22),

('C6','C','Business Incubation Center',
  'Operational BIC supporting student/faculty entrepreneurship.',
  4,'Score 4 if BIC with ≥5 active tenants · Score 2 if 1–4 · Score 0 if no BIC',
  'centers',true,'["BIC registration","Active tenant list"]',23),

('C7','C','Innovation Awards & Recognitions',
  'National or international innovation awards received.',
  2,'Score 2 if ≥3 awards · Score 1 if 1–2 · Score 0 if none',
  'awards',true,'["Award certificates","News coverage"]',24),

('C8','C','Technology Demonstrations & Exhibitions',
  'Technology demonstration events or exhibitions showcasing university research.',
  1,'Score 1 if ≥1 national/international tech exhibition · Score 0 if none',
  'events',true,'["Exhibition participation letters","Booth photographs"]',25),

-- Section D
('D1','D','Industry Collaborations (MoUs)',
  'Active signed MoUs with industry, public sector, or development partners.',
  4,'Score 4 if ≥6 · Score 2 if 3–5 · Score 1 if 1–2',
  'MoUs',true,'["Signed MoUs (active, within 3 years)"]',26),

('D2','D','Community Outreach Programs',
  'Public-good community outreach and knowledge-dissemination activities.',
  3,'Score 3 if ≥8 programs · Score 2 if 4–7 · Score 1 if 1–3',
  'programs',true,'["Event reports","Photographs","Attendance records"]',27),

('D3','D','Conferences & Seminars Hosted',
  'Academic conferences, seminars and symposia organised by the university.',
  3,'Score 3 if ≥5 events · Score 2 if 2–4 · Score 1 if 1',
  'events',true,'["Event brochures","Proceedings"]',28),

('D4','D','International Linkages',
  'Active research collaborations with accredited foreign institutions.',
  2,'Score 2 if ≥4 linkages · Score 1 if 1–3',
  'linkages',true,'["Collaboration agreements with foreign institutions"]',29),

('D5','D','Green & Sustainable Research Initiatives',
  'Research projects focused on environmental sustainability and SDGs.',
  2,'Score 2 if ≥3 active sustainability projects · Score 1 if 1–2 · Score 0 if none',
  'initiatives',true,'["Project summaries","SDG alignment statements"]',30),

('D6','D','Media & Knowledge Dissemination',
  'Research findings disseminated through mainstream media or public lectures.',
  1,'Score 1 if ≥5 media features or public lectures during the year · Score 0 if none',
  'campaigns',true,'["News clippings","Social media screenshots","Public lecture records"]',31)
ON CONFLICT (code) DO NOTHING;

-- ── Sample Score Entries for AY 2024-2025 ────────────────────
INSERT INTO score_entries (period_id, kpi_code, self_score, reported_number, remarks, status)
VALUES
  ('00000000-0000-0000-0000-000000000001','A1',2,5,  'ORIC fully staffed with 5 full-time members.','APPROVED'),
  ('00000000-0000-0000-0000-000000000001','A2',2,4.2,'Budget of PKR 4.2M approved by Syndicate.','RETURNED'),
  ('00000000-0000-0000-0000-000000000001','A3',2,6,  '6 policies including IP, ethics, misconduct SOPs.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','A4',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','A5',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','A6',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','B1',4,8,  '8 proposals across NRPU and TDF calls.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','B2',5,3,  '3 grants totalling PKR 41M.','UNDER_REVIEW'),
  ('00000000-0000-0000-0000-000000000001','B3',9,34, '34 Q1/Q2 publications with DOIs.','APPROVED'),
  ('00000000-0000-0000-0000-000000000001','B4',4,6,  '6 PhD graduates across CS and EE.','REJECTED'),
  ('00000000-0000-0000-0000-000000000001','B5',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','B6',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','B7',3,2,  '2 centers: AI Research Center and Materials Lab.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','B8',3,38, '38 conference papers at IEEE, ACM.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','B9',2,5,  '5 book chapters in Springer/Elsevier.','APPROVED'),
  ('00000000-0000-0000-0000-000000000001','B10',2,2, '2 HEC-recognized journals.','APPROVED'),
  ('00000000-0000-0000-0000-000000000001','B11',0,0, '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','C1',5,4,  '4 patents filed with IPO-Pakistan.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','C2',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','C3',4,2,  '2 startups at DSU Business Incubation Centre.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','C4',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','C5',3,3,  '3 industry-sponsored projects.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','C6',3,1,  'DSU BIC operational with 3 active tenants.','APPROVED'),
  ('00000000-0000-0000-0000-000000000001','C7',1,2,  '2 awards: NAVTTC and regional prize.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','C8',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','D1',4,7,  '7 active MoUs incl. NESPAK, K-Electric.','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','D2',3,9,  '9 outreach programs including STEM visits.','APPROVED'),
  ('00000000-0000-0000-0000-000000000001','D3',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','D4',2,3,  '3 active linkages (UK, Malaysia, KSA).','SUBMITTED'),
  ('00000000-0000-0000-0000-000000000001','D5',0,0,  '','DRAFT'),
  ('00000000-0000-0000-0000-000000000001','D6',0,0,  '','DRAFT')
ON CONFLICT (period_id, kpi_code) DO NOTHING;

-- ── Sample Review Feedback ────────────────────────────────────
INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'perfect','Staffing fully compliant and well documented.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='A1' AND se.status='APPROVED';

INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'minor','Please attach Syndicate meeting minutes approving this budget.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='A2' AND se.status='RETURNED';

INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'perfect','Strong publication output, well evidenced with DOIs.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='B3' AND se.status='APPROVED';

INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'bad','Evidence lists enrolled scholars, not graduates. Provide degree-completion notifications signed by Controller of Examinations.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='B4' AND se.status='REJECTED';

INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'perfect','Good publishing output. Publisher confirmations verified.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='B9' AND se.status='APPROVED';

INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'perfect','BIC fully operational with documented tenants. Approved.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='C6' AND se.status='APPROVED';

INSERT INTO review_feedback (score_entry_id, rating, comment, reviewer_name)
SELECT se.id,'perfect','Comprehensive outreach with strong evidence.','HEC Reviewer'
  FROM score_entries se WHERE se.kpi_code='D2' AND se.status='APPROVED';
