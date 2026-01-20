-- Novo OKR Seed Data for PostgreSQL
-- Generated from novo-dump.sql

-- Disable foreign key checks during seed
SET session_replication_role = replica;

-- Clear existing data
TRUNCATE TABLE project_working_group, project_tasks, projects, key_results, objectives, departments, users RESTART IDENTITY CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Users
INSERT INTO users (id, name, email, avatar_url, created_at, updated_at) VALUES
(1, 'Hannan Munshi', 'hannan.munshi@novo.co', NULL, '2026-01-15T00:46:17.314Z', '2026-01-15T00:46:17.314Z'),
(2, 'Rares Crisan', 'rares.crisan@novo.co', NULL, '2026-01-15T00:46:27.636Z', '2026-01-15T00:46:27.636Z'),
(3, 'Chelsye Knox', 'chelsey.knox@novo.co', NULL, '2026-01-15T00:46:44.583Z', '2026-01-15T00:46:44.583Z'),
(4, 'Erin Albertson', 'erin@novo.co', NULL, '2026-01-15T00:56:30.533Z', '2026-01-15T00:56:30.533Z'),
(5, 'Rubina Singh', 'rubina@novo.co', NULL, '2026-01-15T00:56:41.337Z', '2026-01-15T00:56:41.337Z'),
(6, 'Ryan Graves', 'ryan.graves@novo.co', NULL, '2026-01-15T13:39:25.734Z', '2026-01-15T13:39:25.734Z'),
(7, 'Kyle Joyal', 'kyle.joyal@novo.co', NULL, '2026-01-15T13:40:00.527Z', '2026-01-15T13:40:00.527Z'),
(8, ' Yohana Tanjung-Alfaro', 'Yohana.alfaro@novo.co', NULL, '2026-01-15T13:40:24.574Z', '2026-01-15T13:40:24.574Z'),
(9, 'Steve Gough', 'Steve.gough@novo.co', NULL, '2026-01-15T13:40:50.219Z', '2026-01-15T13:40:50.219Z'),
(10, 'Ash Turner', 'Ash.turner', NULL, '2026-01-15T13:45:53.867Z', '2026-01-15T13:45:53.867Z'),
(11, 'Saadia Chaudhry', 'saadia.chaudry@novo.co', NULL, '2026-01-15T14:09:08.801Z', '2026-01-15T14:09:08.801Z'),
(12, 'Madeline Eckhart', 'madeline.eckhart@novo.co', NULL, '2026-01-15T14:09:45.154Z', '2026-01-15T14:09:45.154Z'),
(13, 'Neha Wahi', 'neha.wahi@novo.co', NULL, '2026-01-15T14:10:10.582Z', '2026-01-15T14:10:10.582Z'),
(14, 'Subhajit Biswas', 'subhajit.biswas@novo.co', NULL, '2026-01-15T14:11:12.822Z', '2026-01-15T14:11:12.822Z'),
(15, 'Salil Jain', 'salil.jain', NULL, '2026-01-15T14:11:36.237Z', '2026-01-15T14:11:36.237Z'),
(16, 'Corey Byrne', 'corey.byrne@novo.co', NULL, '2026-01-15T14:18:47.797Z', '2026-01-15T14:18:47.797Z'),
(17, 'Jackson Barnes', 'jackson.barnes@novo.co', NULL, '2026-01-15T14:27:03.090Z', '2026-01-15T14:27:03.090Z'),
(18, 'Will Levinson', 'will.levinson@novo.co', NULL, '2026-01-15T14:33:19.716Z', '2026-01-15T14:33:19.716Z'),
(19, 'Xiao Dao', 'xiaodao@novo.co', NULL, '2026-01-15T14:33:38.725Z', '2026-01-15T14:33:38.725Z'),
(20, 'Neha Chinai', 'neha.chinai@novo.co', NULL, '2026-01-15T14:51:50.501Z', '2026-01-15T14:51:50.501Z'),
(21, 'Flora Fioriloo', 'flora.fioriloo', NULL, '2026-01-15T14:55:23.040Z', '2026-01-15T14:55:23.040Z');

-- Update users sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Departments
INSERT INTO departments (id, name, description, color, display_order, created_at, updated_at) VALUES
(18, 'Company', NULL, '#4573d2', 0, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(19, 'Marketing', NULL, '#5da283', 1, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(20, 'Customer Support', NULL, '#aa62e3', 2, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(21, 'CX', NULL, '#f1bd6c', 3, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(22, 'Product', NULL, '#f06a6a', 4, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(23, 'Credit', NULL, '#4ecbc4', 5, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(24, 'Banking', NULL, '#4573d2', 7, '2026-01-15 00:34:43', '2026-01-15T14:54:40.584Z'),
(25, 'Finance', NULL, '#5da283', 8, '2026-01-15 00:34:43', '2026-01-15T14:54:38.814Z'),
(26, 'Engineering', NULL, '#aa62e3', 6, '2026-01-15 00:34:43', '2026-01-15T14:54:40.572Z'),
(27, 'People', NULL, '#6c8ebf', 9, '2026-01-15T14:54:33.192Z', '2026-01-15T14:54:33.192Z');

-- Update departments sequence
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- Objectives
INSERT INTO objectives (id, department_id, code, title, description, is_top_objective, display_order, created_at, updated_at) VALUES
(35, 18, 'C-O1', 'Grow core revenue drivers', NULL, false, 0, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(36, 18, 'C-O2', 'Grow core revenue drivers', NULL, false, 1, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(37, 18, 'C-O3', 'Establish improved Banking operations', NULL, false, 2, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(38, 18, 'C-O4', 'Leverage technology to improve productivity', NULL, false, 3, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(39, 19, 'M-O1', 'Grow core revenue drivers', NULL, false, 4, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(40, 19, 'M-O2', 'Improve attach and efficiency from marketing efforts', NULL, false, 5, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(41, 19, 'M-O3', 'Deepen relationship with existing customers', NULL, false, 6, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(42, 20, 'CX-O1', 'Leverage technology to improve productivity', NULL, false, 7, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(43, 21, 'CX-O1', 'Leverage technology to improve productivity', NULL, false, 8, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(44, 20, 'CX-O2', 'Establish improved Banking operations', NULL, false, 9, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(45, 20, 'CX-O3', 'Maximize conversion and retention through differentiated, high-quality experiences', NULL, false, 10, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(46, 22, 'P-O1', 'Grow core revenue drivers', NULL, false, 11, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(47, 22, 'P-O2', 'Establish improved Banking operations', NULL, false, 12, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(48, 23, 'CR-O1', 'Grow core revenue drivers', NULL, false, 13, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(49, 23, 'CR-O2', 'Establish improved Banking operations', NULL, false, 14, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(50, 23, 'CR-O3', 'Launch term loans', NULL, false, 15, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(51, 24, 'B-O1', 'Leverage technology to improve productivity', NULL, false, 16, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(52, 25, 'F-O1', 'Financial Predictability & Operational Controls', NULL, false, 17, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(53, 25, 'F-O2', 'Audit readiness & regulatory controls', NULL, false, 18, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(54, 25, 'F-O3', 'Optimize capital preservation and liquidity-adjusted yield on cash', NULL, false, 19, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(55, 26, 'E-O1', 'Establish improved Banking operations', NULL, false, 20, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(56, 26, 'E-O2', 'Leverage technology to improve productivity', NULL, false, 21, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(57, 26, 'E-O3', 'Improve Information Accessibility', NULL, false, 22, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(58, 26, 'E-O4', 'Improve Observability and Performance', NULL, false, 23, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(59, 26, 'E-O5', 'Security Compliance and Reliability', NULL, false, 24, '2026-01-15 00:34:43', '2026-01-15 00:34:43');

-- Update objectives sequence
SELECT setval('objectives_id_seq', (SELECT MAX(id) FROM objectives));

-- Key Results
INSERT INTO key_results (id, objective_id, code, title, description, baseline_value, baseline_label, target_value, target_label, current_value, current_label, unit_type, target_date, is_top_kr, created_at, updated_at) VALUES
(77, 35, 'KR1.1', 'Increase deposits revenue by getting deposits to $800mm', '', 738181697.0, '', 800000000.0, '', 730000000.0, '', 'currency', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T13:17:49.203Z'),
(78, 36, 'KR2.1', 'Increase credit revenue by improving attach to credit products to 10%', NULL, 4.98, NULL, 10.0, NULL, 4.88, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(79, 36, 'KR2.2', 'Increase interchange revenue by XX%', NULL, 1317487.0, NULL, 0.0, NULL, 0.0, NULL, 'currency', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(80, 37, 'KR3.1', 'Execute banking partnership agreement to add >$4mm topline in FY26', NULL, 0.0, NULL, 4000000.0, NULL, 6000000.0, NULL, 'currency', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(81, 37, 'KR3.2', '>50% of new accounts in Q2 2026 are open under FBO structure', NULL, 0.0, NULL, 50.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(82, 38, 'KR4.1', '50% support ticket resolution through customer self-service', NULL, 0.0, NULL, 50.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(83, 38, 'KR4.2', 'Automatically decision 80% of banking actions', NULL, 64.0, NULL, 80.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(84, 39, 'KR1.1', 'Increase top of funnel to application complete rate (unique onboarding view-to-complete)', '', 47.5, '', 55.0, '', 44.6, '', 'percentage', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T13:16:55.193Z'),
(85, 39, 'KR1.2', 'Add 35,000 more funded accounts', '', 0.0, '', 35000.0, '', 2000.0, '', 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15T01:00:06.109Z'),
(86, 40, 'KR2.1', 'Launch new brand ID + positioning across all owned channels', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(87, 40, 'KR2.2', 'Maintain 18-month payback', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(88, 41, 'KR3.1', 'Increase the number of customers with a credit product from 11,651 to 26,000', NULL, 11651.0, NULL, 26000.0, NULL, 11852.0, NULL, 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(89, 41, 'KR3.2', 'Increase Weekly Active Users (WAUs) by 10%', NULL, 75000.0, NULL, 82500.0, NULL, 74843.0, NULL, 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(90, 41, 'KR3.3', 'Complete overhaul of all omnichannel lifecycle journeys', NULL, 0.0, NULL, 32.0, NULL, 12.0, NULL, 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(91, 42, 'KR1.1', 'Reduce agent resolutions by 40% using self service channels (tickets)', '', 8900.0, '', 5340.0, '', 7748.0, '', 'number', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T13:17:03.436Z'),
(92, 43, 'KR1.2', 'Reduce blended Avg Time to First Reply (hours)', '', 3.0, '', 1.0, '', 1.8, '', 'number', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T17:00:46.795Z'),
(93, 44, 'KR2.1', 'Increase Novo Funding collections rate by 10%', NULL, 13.4, NULL, 14.74, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(94, 45, 'KR3.1', 'Increase CSAT [for first 90 day customers]', NULL, 52.0, NULL, 57.2, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(95, 45, 'KR3.2', 'Maintain 4.2 public trustpilot rating', NULL, 52.0, NULL, 57.2, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(96, 45, 'KR3.3', 'Reduce time to full resolution for top 3 agent-handled inquiries for engaged accounts', NULL, NULL, NULL, -0.2, NULL, 0.0, NULL, 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(97, 46, 'KR1.1', 'Update the first time experience to improve first 90 day funded rate', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(98, 46, 'KR1.2', 'Update onboarding experience that increases overall start-to-open funnel conversion', '', 24.0, '', 29.0, '', 22.19, '', 'percentage', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T17:00:39.713Z'),
(99, 47, 'KR2.1', 'Full general access release for domestic wires', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(100, 47, 'KR2.2', 'Launch BillPay', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(101, 48, 'KR1.1', 'Increase Credit Card revenue', '', 200700.0, '', 451575.0, '', 209207.0, '', 'currency', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T17:00:53.690Z'),
(102, 48, 'KR1.2', 'Open new credit card accounts', NULL, 3974.0, NULL, 12000.0, NULL, 4315.0, NULL, 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(103, 49, 'KR2.1', 'Overall credit program NPV positive (within ROAC constraint of 20%)', NULL, 0.0, NULL, 0.0, NULL, 0.0, NULL, 'number', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(104, 50, 'KR3.1', 'DQ rate of CC% for users activated on term loan', NULL, 0.0, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(105, 51, 'KR1.1', 'Auto-decision more accounts during onboarding', '', 38.0, '', 80.0, '', 0.0, '', 'percentage', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T17:00:59.273Z'),
(106, 51, 'KR1.2', 'Maintain fraud (fraud loss/total GTV) 3-month rolling average posture', NULL, 0.61, NULL, 1.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(107, 51, 'KR1.3', 'Automate 95% of transaction decisions', NULL, 90.0, NULL, 95.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(108, 52, 'KR1.1', 'Reduce Close timing to 10 business days', '', 15.0, '', 10.0, '', 0.0, '', 'number', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T17:01:03.939Z'),
(109, 52, 'KR1.2', 'Complete US Audit 2026 by April 2026', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(110, 52, 'KR1.3', 'Complete India Audit 2026 by July 2026', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(111, 53, 'KR2.1', 'Create 3 Statement Model and maintain a 12 month rolling forecast (Latest Estimate)', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(112, 53, 'KR2.2', 'Create Unit Economics model for each product class', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(113, 53, 'KR2.3', 'Reduce variance in budget vs actuals opex variance', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(114, 54, 'KR3.1', 'Achieve a Net Yield of >90% of the 3-Month Treasury Bill rate', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(115, 54, 'KR3.2', 'Maintain next day liquidity for 6 months worth of burn', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(116, 54, 'KR3.3.1', 'Improve warehouse interest rate', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(117, 54, 'KR3.3.2', 'Improve warehouse advance rate', NULL, 38.0, NULL, 80.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(118, 55, 'KR1.1', 'Launch FBO', '', 0.0, '', 100.0, '', 0.0, '', 'percentage', '2026-06-30', true, '2026-01-15 00:34:43', '2026-01-15T17:01:13.915Z'),
(119, 56, 'KR2.1', 'Launch AI agent infrastructure for company self service of agent creation', NULL, 0.0, NULL, 100.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(120, 57, 'KR3.1', 'Diagram Coverage', NULL, 59.0, NULL, 100.0, NULL, 53.3, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(121, 57, 'KR3.2', 'Technical Documentation (Critical Services/Non Critical Services)', NULL, 41.94, NULL, 100.0, NULL, 38.46, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(122, 58, 'KR4.1', 'Code coverage (Critical/Non Critical Services)', NULL, 30.43, NULL, 100.0, NULL, 100.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(123, 58, 'KR4.2', 'Something tied to Database Query KPI', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(124, 58, 'KR4.3', 'Devops TBD', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(125, 58, 'KR4.4', 'QA TBD', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(126, 59, 'KR5.1', 'Sonarqube Rating "C" or Below', NULL, 29.8, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(127, 59, 'KR5.2', 'SOC2 Completion', NULL, NULL, NULL, 0.0, NULL, 31.6, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43'),
(128, 59, 'KR5.3', 'IT TBD', NULL, NULL, NULL, 0.0, NULL, 0.0, NULL, 'percentage', '2026-06-30', false, '2026-01-15 00:34:43', '2026-01-15 00:34:43');

-- Update key_results sequence
SELECT setval('key_results_id_seq', (SELECT MAX(id) FROM key_results));

-- Projects
INSERT INTO projects (id, name, description, objective_id, dri_user_id, progress_percentage, start_date, end_date, priority, status, color, department_id, display_order, document_link, created_at, updated_at) VALUES
(1, 'FBO ', '', 55, 1, 0, '2026-01-01', '2026-06-01', 'P0', 'in_progress', '#4573d2', 26, 0, NULL, '2026-01-15T00:47:42.884Z', '2026-01-15T00:53:59.562Z'),
(2, 'Rebrand', NULL, 41, 5, 0, '2026-01-01', '2026-03-31', 'P0', 'in_progress', '#4573d2', 19, 0, NULL, '2026-01-15T00:57:43.369Z', '2026-01-15T13:41:19.959Z'),
(4, 'SMS Campaigns', '', 41, 7, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 19, 1, NULL, '2026-01-15T13:41:15.517Z', '2026-01-15T13:41:25.842Z'),
(5, 'Content & Community', NULL, NULL, 4, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 19, 2, NULL, '2026-01-15T13:42:25.329Z', '2026-01-15T13:42:25.329Z'),
(6, 'SEO', NULL, NULL, 9, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 19, 3, NULL, '2026-01-15T13:42:41.498Z', '2026-01-15T13:42:41.498Z'),
(7, 'LifeCycle', '', NULL, 7, 0, NULL, NULL, 'P0', 'not_started', '#4573d2', 19, 4, NULL, '2026-01-15T13:43:00.086Z', '2026-01-15T13:43:49.499Z'),
(8, 'BAU', NULL, NULL, 5, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 19, 5, NULL, '2026-01-15T13:43:38.019Z', '2026-01-15T13:43:38.019Z'),
(10, 'Telephony', '', 42, 10, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 0, NULL, '2026-01-15T13:45:38.549Z', '2026-01-15T14:08:22.129Z'),
(11, 'Zendesk Replacement', '', NULL, 11, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 1, NULL, '2026-01-15T14:12:32.158Z', '2026-01-15T14:12:45.249Z'),
(12, 'Collections', NULL, NULL, 11, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 2, NULL, '2026-01-15T14:13:39.595Z', '2026-01-15T14:13:39.595Z'),
(13, 'Data Automation', NULL, NULL, 15, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 3, NULL, '2026-01-15T14:13:53.766Z', '2026-01-15T14:13:53.766Z'),
(14, 'Account Closures', NULL, NULL, 11, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 4, NULL, '2026-01-15T14:14:44.063Z', '2026-01-15T14:14:44.063Z'),
(15, 'AI Roll Out', NULL, NULL, 11, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 5, NULL, '2026-01-15T14:16:02.582Z', '2026-01-15T14:16:02.582Z'),
(16, 'BAU', NULL, NULL, 11, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 20, 6, NULL, '2026-01-15T14:16:21.815Z', '2026-01-15T14:16:21.815Z'),
(17, 'DDA Decision Application Automation', '', NULL, 16, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 24, 0, NULL, '2026-01-15T14:18:27.167Z', '2026-01-15T14:19:30.424Z'),
(18, 'Transition Operations from MFS to Novo', '', NULL, 16, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 24, 1, NULL, '2026-01-15T14:20:48.391Z', '2026-01-15T14:21:33.958Z'),
(19, 'BAU', NULL, NULL, 16, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 24, 3, NULL, '2026-01-15T14:22:13.942Z', '2026-01-15T19:40:43.393Z'),
(20, 'Credit Report', NULL, NULL, 17, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 0, NULL, '2026-01-15T14:34:26.568Z', '2026-01-15T14:34:26.568Z'),
(21, 'Softpull', NULL, NULL, 18, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 1, NULL, '2026-01-15T14:34:43.765Z', '2026-01-15T14:34:43.765Z'),
(22, 'Disputes', NULL, NULL, 18, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 2, NULL, '2026-01-15T14:37:34.181Z', '2026-01-15T14:37:34.181Z'),
(23, 'Line Management', NULL, NULL, 19, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 3, NULL, '2026-01-15T14:38:15.119Z', '2026-01-15T14:38:15.119Z'),
(24, 'Model Rebuilds', NULL, NULL, 15, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 4, NULL, '2026-01-15T14:38:43.508Z', '2026-01-15T14:38:43.508Z'),
(25, 'Term Loans ', NULL, NULL, 19, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 5, NULL, '2026-01-15T14:39:32.408Z', '2026-01-15T14:39:32.408Z'),
(26, 'Line Of Credit', NULL, NULL, 17, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 6, NULL, '2026-01-15T14:39:50.801Z', '2026-01-15T14:39:50.801Z'),
(27, 'BAU', NULL, NULL, 18, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 23, 7, NULL, '2026-01-15T14:44:40.109Z', '2026-01-15T14:44:40.109Z'),
(28, 'New Warehouse', '', NULL, 20, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 25, 0, NULL, '2026-01-15T14:51:16.304Z', '2026-01-15T14:54:24.113Z'),
(29, 'Complete US Audit', NULL, NULL, 20, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 25, 1, NULL, '2026-01-15T14:52:29.931Z', '2026-01-15T14:52:29.931Z'),
(30, 'Updated forecasting model', NULL, NULL, 20, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 25, 2, NULL, '2026-01-15T14:53:02.186Z', '2026-01-15T14:53:02.186Z'),
(31, '3 Statement model', NULL, NULL, 20, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 25, 3, NULL, '2026-01-15T14:53:20.702Z', '2026-01-15T14:53:20.702Z'),
(32, 'Improved Monthly Closing Process', NULL, NULL, 20, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 25, 4, NULL, '2026-01-15T14:53:47.400Z', '2026-01-15T14:53:47.400Z'),
(33, 'BAU', NULL, NULL, 20, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 25, 5, NULL, '2026-01-15T14:54:09.757Z', '2026-01-15T14:54:09.757Z'),
(34, 'Onboarding', NULL, NULL, 21, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 27, 0, NULL, '2026-01-15T14:55:47.968Z', '2026-01-15T14:55:47.968Z'),
(35, 'Recruiting', NULL, NULL, 21, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 27, 1, NULL, '2026-01-15T14:56:06.151Z', '2026-01-15T14:56:06.151Z'),
(36, 'Feedback loops', '', NULL, 21, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 27, 0, NULL, '2026-01-15T14:56:34.420Z', '2026-01-15T14:57:06.572Z'),
(37, 'Leveling', NULL, NULL, 21, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 27, 2, NULL, '2026-01-15T14:56:54.578Z', '2026-01-15T14:56:54.578Z'),
(38, 'AI Agent Architecture', NULL, NULL, 13, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 1, NULL, '2026-01-15T14:59:12.986Z', '2026-01-15T14:59:12.986Z'),
(39, 'Rebrand UI', NULL, NULL, 2, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 2, NULL, '2026-01-15T14:59:33.172Z', '2026-01-15T14:59:33.172Z'),
(40, 'Database JSON migration', NULL, NULL, 2, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 3, NULL, '2026-01-15T15:00:42.639Z', '2026-01-15T15:00:42.639Z'),
(41, 'Ntropy Model Replacement', NULL, NULL, 2, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 4, NULL, '2026-01-15T15:01:23.754Z', '2026-01-15T15:01:23.754Z'),
(42, 'SOC2 Audit', NULL, NULL, 2, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 5, NULL, '2026-01-15T15:01:41.181Z', '2026-01-15T15:01:41.181Z'),
(43, 'IT BAU', NULL, NULL, 2, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 6, NULL, '2026-01-15T15:01:54.921Z', '2026-01-15T15:01:54.921Z'),
(44, 'Devops BAU', NULL, NULL, 2, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 26, 7, NULL, '2026-01-15T15:02:06.147Z', '2026-01-15T15:02:06.147Z'),
(45, 'MRDC Automation', NULL, NULL, 15, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 24, 2, NULL, '2026-01-15T19:40:39.665Z', '2026-01-15T19:40:43.393Z'),
(46, 'Culture', NULL, NULL, 21, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 27, 3, NULL, '2026-01-15T19:45:20.946Z', '2026-01-15T19:45:20.946Z'),
(47, 'BAU', NULL, NULL, 21, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', 27, 4, NULL, '2026-01-15T19:45:42.011Z', '2026-01-15T19:45:42.011Z'),
(48, 'Website Redesign', NULL, NULL, 4, 0, NULL, NULL, 'P1', 'not_started', '#4573d2', NULL, 0, NULL, '2026-01-17T19:00:48.411Z', '2026-01-17T19:00:48.411Z');

-- Update projects sequence
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- Project Working Groups
INSERT INTO project_working_group (id, project_id, user_id, role, created_at) VALUES
(3, 1, 2, NULL, '2026-01-15T00:53:59.562Z'),
(4, 1, 3, NULL, '2026-01-15T00:53:59.562Z'),
(5, 2, 4, NULL, '2026-01-15T00:57:43.369Z');

-- Update project_working_group sequence
SELECT setval('project_working_group_id_seq', (SELECT MAX(id) FROM project_working_group));

-- Project Tasks
INSERT INTO project_tasks (id, project_id, title, description, assignee_user_id, status, start_date, end_date, display_order, document_link, created_at, updated_at) VALUES
(1, 1, 'Twisp Ledger Contrat', NULL, 2, 'completed', '2025-12-01', '2026-01-01', 1, NULL, '2026-01-15T00:48:10.348Z', '2026-01-15T00:48:10.348Z'),
(2, 1, 'FedLine Command', '', 3, 'in_progress', '2026-01-01', '2026-02-28', 2, NULL, '2026-01-15T00:53:01.356Z', '2026-01-15T00:53:07.776Z'),
(3, 2, 'Brand identity + positioning', NULL, 4, 'not_started', NULL, NULL, 1, NULL, '2026-01-15T00:57:52.274Z', '2026-01-15T00:57:52.274Z'),
(4, 2, 'Website Overhaul (including Help Center)', NULL, 5, 'not_started', NULL, NULL, 2, NULL, '2026-01-15T00:58:16.473Z', '2026-01-15T00:58:16.473Z');

-- Update project_tasks sequence
SELECT setval('project_tasks_id_seq', (SELECT MAX(id) FROM project_tasks));
