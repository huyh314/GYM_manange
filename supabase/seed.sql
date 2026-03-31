-- SIMULATION SEED DATA (RE-RUNNABLE)
-- 0. Ensure tables exist before trying to delete from them
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  phone varchar(15) UNIQUE NOT NULL,
  password_hash varchar NOT NULL,
  role varchar(10) CHECK (role IN ('admin','pt','client')),
  notes text,
  avatar_url varchar,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  rate_per_session INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  total_sessions int NOT NULL,
  price bigint NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES users(id),
  package_id uuid REFERENCES packages(id),
  pt_id uuid REFERENCES users(id),
  total_sessions int NOT NULL,
  remaining_sessions int NOT NULL,
  amount_paid bigint,
  status varchar(10) DEFAULT 'active',
  start_date date DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_package_id uuid REFERENCES user_packages(id),
  pt_id uuid REFERENCES users(id),
  client_id uuid REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  checked_in_at timestamptz,
  status varchar(15) DEFAULT 'scheduled',
  logbook jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES users(id),
  weight_kg decimal(5,1) NOT NULL,
  recorded_at date NOT NULL DEFAULT current_date,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Clean up existing simulation data
DELETE FROM weight_logs;
DELETE FROM sessions;
DELETE FROM user_packages;
DELETE FROM users WHERE role IN ('pt', 'client');
DELETE FROM packages;

-- 1. Insert Packages
INSERT INTO packages (id, name, total_sessions, price, tier, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Gói Giảm Cân Cấp Tốc (12 Buổi)', 12, 5000000, 'normal', 'Giảm mỡ thừa hiệu quả.'),
('22222222-2222-2222-2222-222222222222', 'Gói Tăng Cơ Toàn Diện (24 Buổi)', 24, 8000000, 'normal', 'Xây dựng cơ bắp săn chắc.');

-- 2. Insert Users
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000001', 'Coach Hoang', '0911111111', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'pt');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000002', 'Coach Nam', '0922222222', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'pt');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000003', 'Nguyen Van An', '0933333331', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'client');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000004', 'Tran Thi Binh', '0933333332', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'client');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000005', 'Le Van Chi', '0933333333', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'client');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000006', 'Pham Duy Dung', '0933333334', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'client');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000007', 'Vu Thu Em', '0933333335', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'client');
INSERT INTO users (id, name, phone, password_hash, role) VALUES ('00000000-0000-0000-0000-000000000008', 'Doan Hoang Giang', '0933333336', '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO', 'client');

-- 3. Insert User Packages
INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 12, 6, 5000000);
INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 12, 6, 5000000);
INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 12, 6, 5000000);
INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 24, 18, 8000000);
INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 24, 18, 8000000);
INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 24, 18, 8000000);

-- 4. Insert Sessions
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-01 08:00:00+07', '2026-04-01 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-03 08:00:00+07', '2026-04-03 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-05 08:00:00+07', '2026-04-05 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-08 08:00:00+07', '2026-04-08 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-10 08:00:00+07', '2026-04-10 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-12 08:00:00+07', '2026-04-12 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-15 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-17 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-19 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-22 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-24 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-26 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000003' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-01 08:00:00+07', '2026-04-01 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-03 08:00:00+07', '2026-04-03 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-05 08:00:00+07', '2026-04-05 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-08 08:00:00+07', '2026-04-08 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-10 08:00:00+07', '2026-04-10 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-12 08:00:00+07', '2026-04-12 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-15 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-17 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-19 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-22 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-24 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-26 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-01 08:00:00+07', '2026-04-01 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-03 08:00:00+07', '2026-04-03 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-05 08:00:00+07', '2026-04-05 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-08 08:00:00+07', '2026-04-08 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-10 08:00:00+07', '2026-04-10 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-12 08:00:00+07', '2026-04-12 08:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-15 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-17 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-19 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-22 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-24 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-26 08:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000005' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-02 17:00:00+07', '2026-04-02 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-04 17:00:00+07', '2026-04-04 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-06 17:00:00+07', '2026-04-06 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-09 17:00:00+07', '2026-04-09 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-11 17:00:00+07', '2026-04-11 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-13 17:00:00+07', '2026-04-13 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-16 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-18 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-20 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-23 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-25 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-27 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000006' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-02 17:00:00+07', '2026-04-02 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-04 17:00:00+07', '2026-04-04 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-06 17:00:00+07', '2026-04-06 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-09 17:00:00+07', '2026-04-09 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-11 17:00:00+07', '2026-04-11 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-13 17:00:00+07', '2026-04-13 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-16 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-18 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-20 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-23 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-25 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-27 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000007' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-02 17:00:00+07', '2026-04-02 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-04 17:00:00+07', '2026-04-04 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-06 17:00:00+07', '2026-04-06 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-09 17:00:00+07', '2026-04-09 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-11 17:00:00+07', '2026-04-11 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-13 17:00:00+07', '2026-04-13 17:00:00+07', 'completed', '[{"exercise":"Bench Press","sets":3,"reps":10,"weight":60},{"exercise":"Squat","sets":3,"reps":10,"weight":80}]'
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-16 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-18 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-20 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-23 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-25 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;
INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '2026-04-27 17:00:00+07', NULL, 'scheduled', NULL
FROM user_packages WHERE client_id = '00000000-0000-0000-0000-000000000008' LIMIT 1;

-- 5. Insert Weight Logs
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000003', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000003', 73.5, '2026-04-15');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000004', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000004', 73.5, '2026-04-15');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000005', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000005', 73.5, '2026-04-15');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000006', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000006', 73.5, '2026-04-15');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000007', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000007', 73.5, '2026-04-15');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000008', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('00000000-0000-0000-0000-000000000008', 73.5, '2026-04-15');
