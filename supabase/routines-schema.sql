-- =============================================
-- ROUTINES & WORKOUT BUILDER
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS routines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id  UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets         INTEGER DEFAULT 3,
  reps         TEXT DEFAULT '12', 
  rest_seconds INTEGER DEFAULT 60,
  order_index  INTEGER DEFAULT 0,
  note         TEXT
);

-- Link sessions to routines
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS routine_id UUID REFERENCES routines(id);

-- Enable RLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for routines
CREATE POLICY "Everyone can view routines" ON routines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and PTs can create/edit routines" ON routines FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'app_role' IN ('admin', 'pt'));

-- Policies for routine_exercises
CREATE POLICY "Everyone can view routine_exercises" ON routine_exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and PTs can manage routine_exercises" ON routine_exercises FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'app_role' IN ('admin', 'pt'));
