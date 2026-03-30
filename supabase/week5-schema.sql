-- =============================================
-- WEEK 5 — Database Changes
-- Run this in Supabase SQL Editor
-- =============================================

-- ========== TASK 2: Progress Photos ==========
CREATE TABLE IF NOT EXISTS progress_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  photo_url   TEXT NOT NULL,
  photo_type  TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_client ON progress_photos(client_id, taken_at DESC);

-- ========== TASK 3: Exercise Library ==========
CREATE TABLE IF NOT EXISTS exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  name_en      TEXT,
  muscle_group TEXT NOT NULL,
  equipment    TEXT,
  description  TEXT,
  video_url    TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Seed 30 common exercises
INSERT INTO exercises (name, name_en, muscle_group, equipment) VALUES
  ('Bench Press', 'Bench Press', 'chest', 'barbell'),
  ('Incline Dumbbell Press', 'Incline DB Press', 'chest', 'dumbbell'),
  ('Pec Dec / Chest Fly', 'Pec Dec', 'chest', 'machine'),
  ('Cable Crossover', 'Cable Crossover', 'chest', 'cable'),
  ('Push Up', 'Push Up', 'chest', 'bodyweight'),
  ('Pull Up', 'Pull Up', 'back', 'bodyweight'),
  ('Lat Pulldown', 'Lat Pulldown', 'back', 'cable'),
  ('Seated Cable Row', 'Cable Row', 'back', 'cable'),
  ('Deadlift', 'Deadlift', 'back', 'barbell'),
  ('Barbell Row', 'Barbell Row', 'back', 'barbell'),
  ('Squat', 'Squat', 'legs', 'barbell'),
  ('Leg Press', 'Leg Press', 'legs', 'machine'),
  ('Romanian Deadlift', 'RDL', 'legs', 'barbell'),
  ('Leg Curl', 'Leg Curl', 'legs', 'machine'),
  ('Leg Extension', 'Leg Extension', 'legs', 'machine'),
  ('Calf Raise', 'Calf Raise', 'legs', 'machine'),
  ('Bulgarian Split Squat', 'Bulgarian Split Squat', 'legs', 'dumbbell'),
  ('Overhead Press', 'OHP', 'shoulders', 'barbell'),
  ('Dumbbell Lateral Raise', 'Lateral Raise', 'shoulders', 'dumbbell'),
  ('Face Pull', 'Face Pull', 'shoulders', 'cable'),
  ('Rear Delt Fly', 'Rear Delt Fly', 'shoulders', 'dumbbell'),
  ('Barbell Curl', 'Barbell Curl', 'arms', 'barbell'),
  ('Dumbbell Curl', 'DB Curl', 'arms', 'dumbbell'),
  ('Hammer Curl', 'Hammer Curl', 'arms', 'dumbbell'),
  ('Tricep Pushdown', 'Tricep Pushdown', 'arms', 'cable'),
  ('Skull Crusher', 'Skull Crusher', 'arms', 'barbell'),
  ('Dips', 'Dips', 'arms', 'bodyweight'),
  ('Plank', 'Plank', 'core', 'bodyweight'),
  ('Hanging Leg Raise', 'Leg Raise', 'core', 'bodyweight'),
  ('Cable Crunch', 'Cable Crunch', 'core', 'cable'),
  ('Crunch', 'Crunch', 'core', 'bodyweight'),
  ('Russian Twist', 'Russian Twist', 'core', 'bodyweight'),
  ('Treadmill', 'Treadmill', 'cardio', NULL),
  ('Stationary Bike', 'Stationary Bike', 'cardio', NULL),
  ('Rowing Machine', 'Rowing Machine', 'cardio', NULL),
  ('Jump Rope', 'Jump Rope', 'cardio', NULL)
ON CONFLICT (name) DO NOTHING;

-- ========== TASK 4: Payroll ==========
ALTER TABLE users ADD COLUMN IF NOT EXISTS rate_per_session INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS payroll_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pt_id            UUID NOT NULL REFERENCES users(id),
  month            DATE NOT NULL,
  sessions_count   INTEGER NOT NULL,
  rate_per_session INTEGER NOT NULL,
  total_amount     BIGINT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at          TIMESTAMP,
  note             TEXT,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_pt_month ON payroll_records(pt_id, month);

-- Done! Now create a Supabase Storage bucket called 'progress-photos' (public: false)
-- from the Supabase Dashboard > Storage > New Bucket
