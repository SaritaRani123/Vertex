BEGIN;

SET search_path TO course_schema;

-- =========================
-- DEPARTMENTS
-- =========================
INSERT INTO course_schema.departments (id, name, code, created_at, updated_at)
VALUES
  (1, 'Faculty of Applied Sciences & Technology', 'FAST', NOW(), NOW()),
  (2, 'Longo Faculty of Business', 'LFB', NOW(), NOW()),
  (3, 'Faculty of Media, Creative Arts & Design', 'FMCAD', NOW(), NOW()),
  (4, 'Faculty of Health & Life Sciences', 'FHLS', NOW(), NOW()),
  (5, 'Faculty of Liberal Arts & Sciences', 'FLAS', NOW(), NOW()),
  (6, 'Faculty of Social & Community Services', 'FSCS', NOW(), NOW()),
  (7, 'Faculty of Continuous Professional Learning', 'CPL', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================
-- PROGRAMS
-- =========================
INSERT INTO course_schema.programs
(id, name, code, duration_years, status, department_id, created_at, updated_at)
VALUES
  (1, 'Information Technology Solutions', 'IT521', 2, 'ACTIVE', 1, NOW(), NOW()),
  (2, 'Web Development', '11491', 1, 'ACTIVE', 1, NOW(), NOW()),
  (3, 'Business Administration', '02511', 3, 'ACTIVE', 2, NOW(), NOW()),
  (4, 'Animation - 3D', 'AN311', 3, 'ACTIVE', 3, NOW(), NOW()),
  (5, 'Practical Nursing', '19121', 2, 'ACTIVE', 4, NOW(), NOW()),
  (6, 'General Arts and Science - University Transfer', '09111', 2, 'ACTIVE', 5, NOW(), NOW()),
  (7, 'Addictions and Mental Health', 'MH511', 1, 'ACTIVE', 6, NOW(), NOW()),
  (8, 'Social Service Worker', '01221', 2, 'ACTIVE', 6, NOW(), NOW()),
  (9, 'Real Estate Salesperson Program', 'RE101', 1, 'ACTIVE', 7, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================
-- COURSES
-- =========================
INSERT INTO course_schema.courses
(id, name, code, description, prerequisites, credits, lecture_hours, lab_hours, status, program_id, created_at, updated_at)
VALUES
  (1, 'Java Programming', 'ITSN511', 'Core Java concepts including OOP and collections.', ARRAY[]::TEXT[], 3, 3, 2, 'ACTIVE', 1, NOW(), NOW()),
  (2, 'Frontend Frameworks', 'WDEV201', 'Deep dive into React and Next.js.', ARRAY['WDEV150'], 3, 2, 3, 'ACTIVE', 2, NOW(), NOW()),
  (3, 'Anatomy & Physiology', 'GSCI110', 'Study of the human body systems.', ARRAY[]::TEXT[], 4, 4, 0, 'ACTIVE', 5, NOW(), NOW()),
  (4, 'Critical Thinking', 'GCRT100', 'Foundations of logic and academic inquiry.', ARRAY[]::TEXT[], 3, 3, 0, 'ACTIVE', 6, NOW(), NOW()),
  (5, 'Mental Health Fundamentals', 'MHNF101', 'Introduction to mental health disorders and recovery.', ARRAY[]::TEXT[], 3, 3, 0, 'ACTIVE', 7, NOW(), NOW()),

  (6, 'Database Systems', 'ITSN512', 'Relational databases, SQL, normalization, and transactions.', ARRAY['ITSN511'], 3, 3, 2, 'ACTIVE', 1, NOW(), NOW()),
  (7, 'Cloud Fundamentals', 'ITSN513', 'Introduction to cloud platforms, virtualization, and deployment.', ARRAY[]::TEXT[], 3, 2, 2, 'ACTIVE', 1, NOW(), NOW()),
  (8, 'Backend Development', 'WDEV202', 'Server-side development with APIs and databases.', ARRAY['WDEV201'], 3, 2, 3, 'ACTIVE', 2, NOW(), NOW()),
  (9, 'Business Communication', 'BUS101', 'Professional communication in business environments.', ARRAY[]::TEXT[], 3, 3, 0, 'ACTIVE', 3, NOW(), NOW()),
  (10, 'Accounting Basics', 'ACCT101', 'Introduction to financial and managerial accounting.', ARRAY[]::TEXT[], 3, 3, 0, 'ACTIVE', 3, NOW(), NOW()),
  (11, '3D Modelling Fundamentals', 'ANIM201', 'Fundamentals of modelling 3D assets and environments.', ARRAY[]::TEXT[], 4, 2, 4, 'ACTIVE', 4, NOW(), NOW()),
  (12, 'Community Practice', 'SSW101', 'Introduction to social service work in community settings.', ARRAY[]::TEXT[], 3, 3, 0, 'ACTIVE', 8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================
-- SEMESTERS
-- =========================
INSERT INTO course_schema.semesters (id, year, type, created_at, updated_at)
VALUES
  (1, 2025, 'FALL', NOW(), NOW()),
  (2, 2026, 'WINTER', NOW(), NOW()),
  (3, 2026, 'SUMMER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================
-- TERMS
-- =========================
INSERT INTO course_schema.terms (id, semester_id, course_id, created_at)
VALUES
  (1, 1, 1, NOW()),
  (2, 1, 3, NOW()),
  (3, 2, 2, NOW()),
  (4, 2, 4, NOW()),
  (5, 2, 5, NOW()),
  (6, 2, 6, NOW()),
  (7, 2, 7, NOW()),
  (8, 3, 8, NOW()),
  (9, 3, 9, NOW()),
  (10, 3, 10, NOW()),
  (11, 3, 11, NOW()),
  (12, 3, 12, NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================
-- FIX SEQUENCES
-- =========================
SELECT setval(
  pg_get_serial_sequence('course_schema.departments', 'id'),
  COALESCE((SELECT MAX(id) FROM course_schema.departments), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('course_schema.programs', 'id'),
  COALESCE((SELECT MAX(id) FROM course_schema.programs), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('course_schema.courses', 'id'),
  COALESCE((SELECT MAX(id) FROM course_schema.courses), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('course_schema.semesters', 'id'),
  COALESCE((SELECT MAX(id) FROM course_schema.semesters), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('course_schema.terms', 'id'),
  COALESCE((SELECT MAX(id) FROM course_schema.terms), 1),
  true
);

COMMIT;